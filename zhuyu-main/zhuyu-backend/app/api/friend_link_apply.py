"""友链申请接口"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select

from app.deps import get_session, get_current_user
from app.models.friend_link import FriendLink

router = APIRouter(prefix="/api/friend-links", tags=["友链申请"])


class FriendLinkApplyRequest(BaseModel):
    name: str
    url: str
    avatar: str = ""
    description: str = ""


class FriendLinkApproveRequest(BaseModel):
    link_id: int
    approved: bool


# ---- 公开接口：提交申请（需要登录） ----

@router.post("/apply")
def apply_friend_link(
    data: FriendLinkApplyRequest,
    request: Request,
    session: Session = Depends(get_session),
):
    """提交友链申请"""
    from fastapi import Request
    # 检查是否有 GitHub 或 QQ 登录
    auth = request.headers.get("Authorization", "")
    user_info = None

    if auth.startswith("Bearer "):
        token = auth[7:]
        try:
            from jose import jwt
            from app.config import SECRET_KEY, ALGORITHM
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_type = payload.get("type", "")
            if user_type == "github":
                user_info = f"github:{payload.get('login', '')}"
            elif user_type == "qq":
                user_info = f"qq:{payload.get('nickname', '')}"
        except Exception:
            pass

    if not user_info:
        raise HTTPException(401, "请先通过 GitHub 或 QQ 登录")

    # 检查是否已申请过
    existing = session.exec(
        select(FriendLink).where(
            FriendLink.url == data.url,
            FriendLink.is_approved == False,
        )
    ).first()
    if existing:
        raise HTTPException(400, "该链接已在审核中，请等待审批")

    # 创建申请
    link = FriendLink(
        name=data.name,
        url=data.url,
        avatar=data.avatar,
        description=data.description,
        is_approved=False,
    )
    session.add(link)
    session.commit()
    session.refresh(link)

    return {"message": "申请已提交，请等待博主审批", "id": link.id}


# ---- 管理接口：查看/审批申请 ----

@router.get("/pending")
def get_pending_links(
    session: Session = Depends(get_session),
    _admin=Depends(get_current_user),
):
    """获取待审批的友链申请"""
    stmt = select(FriendLink).where(FriendLink.is_approved == False).order_by(FriendLink.created_at.desc())
    links = session.exec(stmt).all()
    return [
        {
            "id": l.id,
            "name": l.name,
            "url": l.url,
            "avatar": l.avatar,
            "description": l.description,
            "created_at": l.created_at.isoformat() if l.created_at else "",
        }
        for l in links
    ]


@router.post("/approve")
def approve_link(
    data: FriendLinkApproveRequest,
    session: Session = Depends(get_session),
    _admin=Depends(get_current_user),
):
    """审批友链申请"""
    link = session.get(FriendLink, data.link_id)
    if not link:
        raise HTTPException(404, "友链不存在")
    if data.approved:
        link.is_approved = True
        link.updated_at = datetime.now()
        session.add(link)
        session.commit()
        return {"message": "友链已通过"}
    else:
        session.delete(link)
        session.commit()
        return {"message": "申请已拒绝并删除"}
