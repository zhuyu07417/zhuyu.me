"""QQ 登录 — 心月互联第三方方案"""
import os
import httpx
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from jose import jwt
from app.deps import get_session
from app.config import SECRET_KEY, ALGORITHM
from app.models.qq_user import QQUser
from app.models.site_config import SiteConfig

router = APIRouter(prefix="/api/auth/qq", tags=["QQ 登录"])
XINYUE_API = "https://your-qq-platform.com/api"
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "https://www.your-domain.com")

def get_qq_token(session: Session) -> str:
    stmt = select(SiteConfig).where(SiteConfig.key == "xinyue_qq_token")
    item = session.exec(stmt).first()
    if item and item.value:
        return item.value if isinstance(item.value, str) else str(item.value)
    return os.environ.get("XINYUE_QQ_TOKEN", "")


@router.get("/me")
def get_me(request: Request, session: Session = Depends(get_session)):
    """获取当前 QQ 用户信息"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "未登录")
    token = auth[7:]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(401, "登录已过期")
    user = session.get(QQUser, user_id)
    if not user:
        raise HTTPException(401, "用户不存在")
    return {"login": user.nickname, "avatar": user.avatar, "type": "qq"}

@router.get("/login")
def qq_login(request: Request, redirect: str = "/", session: Session = Depends(get_session)):
    token = get_qq_token(session)
    if not token:
        raise HTTPException(500, "未配置 QQ 登录 token，请在后台站点配置 xinyue_qq_token")
    # 将 redirect 参数编码到 state 中传递
    import urllib.parse
    state = urllib.parse.quote(redirect)
    return RedirectResponse(f"{XINYUE_API}/qq.php?token={token}&display=pc&state={state}")

@router.get("/callback")
def qq_callback(code: str, msg: str = "", state: str = "", session: Session = Depends(get_session)):
    # 解码 redirect 参数
    import urllib.parse
    redirect_path = urllib.parse.unquote(state) if state else "/"
    
    if not code:
        return RedirectResponse(f"{FRONTEND_ORIGIN}{redirect_path}?error=code_empty")
    try:
        resp = httpx.get(f"{XINYUE_API}/get_user_info.php", params={"code": code}, timeout=10)
        user_info = resp.json()
    except Exception:
        return RedirectResponse(f"{FRONTEND_ORIGIN}{redirect_path}?error=api_failed")
    
    qq_openid = str(user_info.get("openid", "") or user_info.get("open_id", "") or user_info.get("uid", ""))
    nickname = user_info.get("nickname", "") or user_info.get("nick_name", "") or "QQ用户"
    avatar = (user_info.get("figureurl_qq_2", "") or user_info.get("figureurl_qq_1", "") or user_info.get("figureurl_qq", "") or user_info.get("avatar", "") or "").replace("http://", "https://")
    
    print(f"[QQ回调] 心月互联返回: {user_info}")
    if not qq_openid:
        return RedirectResponse(f"{FRONTEND_ORIGIN}{redirect_path}?error=no_openid")
    
    existing = session.exec(select(QQUser).where(QQUser.openid == qq_openid)).first()
    if existing:
        existing.nickname = nickname
        existing.avatar = avatar
        session.add(existing)
        session.commit()
        session.refresh(existing)
        db_user = existing
    else:
        db_user = QQUser(openid=qq_openid, nickname=nickname, avatar=avatar)
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    
    token = jwt.encode({"sub": str(db_user.id), "nickname": db_user.nickname, "type": "qq"}, SECRET_KEY, algorithm=ALGORITHM)
    # 如果state为空（心月互联不支持state参数回传），不传递redirect参数，让前端使用sessionStorage
    if state:
        return RedirectResponse(f"{FRONTEND_ORIGIN}/auth/callback?token={token}&type=qq&redirect={urllib.parse.quote(redirect_path)}")
    else:
        return RedirectResponse(f"{FRONTEND_ORIGIN}/auth/callback?token={token}&type=qq")


def get_qq_user_optional(request: Request, session: Session) -> QQUser | None:
    """可选登录：未登录返回 None"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "qq":
            return None
        user_id = int(payload["sub"])
        return session.get(QQUser, user_id)
    except Exception:
        return None
