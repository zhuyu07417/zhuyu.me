"""QQ OAuth 登录"""

import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from jose import jwt

from app.deps import get_session
from app.config import SECRET_KEY, ALGORITHM
from app.models.qq_user import QQUser

router = APIRouter(prefix="/api/auth/qq", tags=["QQ 登录"])

# QQ 互联配置
QQ_APP_ID = os.environ.get("QQ_APP_ID", "")
QQ_APP_KEY = os.environ.get("QQ_APP_KEY", "")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "https://www.your-domain.com")

# QQ 互联 API 地址
QQ_AUTHORIZE_URL = "https://graph.qq.com/oauth2.0/authorize"
QQ_TOKEN_URL = "https://graph.qq.com/oauth2.0/token"
QQ_OPENID_URL = "https://graph.qq.com/oauth2.0/me"
QQ_USER_INFO_URL = "https://graph.qq.com/user/get_user_info"


@router.get("/login")
def qq_login():
    """跳转到 QQ 授权页"""
    if not QQ_APP_ID:
        raise HTTPException(500, "未配置 QQ_APP_ID")
    import secrets
    state = secrets.token_hex(16)
    redirect_uri = f"{FRONTEND_ORIGIN}/api/auth/qq/callback"
    url = (
        f"{QQ_AUTHORIZE_URL}"
        f"?response_type=code"
        f"&client_id={QQ_APP_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&scope=get_user_info"
        f"&state={state}"
    )
    return RedirectResponse(url)


@router.get("/callback")
def qq_callback(
    code: str,
    request: Request,
    session: Session = Depends(get_session),
):
    """QQ 回调：用 code 换 token → 获取 openid → 获取用户信息 → 生成 JWT"""
    redirect_uri = f"{FRONTEND_ORIGIN}/api/auth/qq/callback"

    # 1. code 换 access_token
    token_resp = httpx.get(
        QQ_TOKEN_URL,
        params={
            "grant_type": "authorization_code",
            "client_id": QQ_APP_ID,
            "client_secret": QQ_APP_KEY,
            "code": code,
            "redirect_uri": redirect_uri,
            "fmt": "json",
        },
        timeout=10,
    )
    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(400, "QQ 授权失败")

    # 2. 获取 openid
    openid_resp = httpx.get(
        QQ_OPENID_URL,
        params={"access_token": access_token, "fmt": "json"},
        timeout=10,
    )
    openid_data = openid_resp.json()
    openid = openid_data.get("openid")
    if not openid:
        raise HTTPException(400, "获取 QQ openid 失败")

    # 3. 获取用户信息
    user_resp = httpx.get(
        QQ_USER_INFO_URL,
        params={
            "access_token": access_token,
            "oauth_consumer_key": QQ_APP_ID,
            "openid": openid,
            "format": "json",
        },
        timeout=10,
    )
    user_data = user_resp.json()
    nickname = user_data.get("nickname", "")
    avatar = user_data.get("figureurl_qq_2") or user_data.get("figureurl_qq_1", "")

    # 4. 查找或创建 qq_user
    existing = session.exec(
        select(QQUser).where(QQUser.openid == openid)
    ).first()

    if existing:
        existing.nickname = nickname or existing.nickname
        existing.avatar = avatar or existing.avatar
        session.add(existing)
        session.commit()
        session.refresh(existing)
        db_user = existing
    else:
        db_user = QQUser(
            openid=openid,
            nickname=nickname,
            avatar=avatar,
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)

    # 5. 签发 JWT（type:"qq" 区分 GitHub 用户）
    token = jwt.encode(
        {"sub": str(db_user.id), "login": db_user.nickname, "type": "qq"},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    # 6. 重定向回前端统一回调页
    redirect_url = f"{FRONTEND_ORIGIN}/auth/callback?token={token}&type=qq"
    return RedirectResponse(redirect_url)


@router.get("/me")
def get_me(
    request: Request,
    session: Session = Depends(get_session),
):
    """获取当前登录的 QQ 用户信息"""
    user = _get_qq_user(request, session)
    return {
        "id": user.id,
        "login": user.nickname,
        "avatar": user.avatar,
        "bio": "",
        "type": "qq",
    }


def _get_qq_user(request: Request, session: Session) -> QQUser:
    """从 Authorization header 解析 JWT，返回 QQUser"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "未登录")
    token = auth[7:]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "qq":
            raise HTTPException(401, "非 QQ 用户")
        user_id = int(payload["sub"])
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "登录已过期，请重新登录")
    user = session.get(QQUser, user_id)
    if not user:
        raise HTTPException(401, "用户不存在")
    return user


def get_qq_user_optional(request: Request, session: Session) -> QQUser | None:
    """可选登录：未登录返回 None"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        token = auth[7:]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "qq":
            return None
        user_id = int(payload["sub"])
        return session.get(QQUser, user_id)
    except Exception:
        return None
