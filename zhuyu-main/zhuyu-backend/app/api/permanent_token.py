"""永久管理员密钥管理"""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.deps import get_session, get_current_user
from app.models.site_config import SiteConfig

router = APIRouter(prefix="/api/admin/permanent-token", tags=["永久密钥"])

KEY = "permanent_admin_token"


class TokenResponse(BaseModel):
    token: str
    created_at: str


@router.get("")
def get_token(
    session: Session = Depends(get_session),
    _admin=Depends(get_current_user),
):
    """查看当前永久密钥"""
    stmt = select(SiteConfig).where(SiteConfig.key == KEY)
    item = session.exec(stmt).first()
    if not item or not item.value:
        return {"token": "", "created_at": "", "message": "未设置"}
    return {
        "token": item.value if isinstance(item.value, str) else str(item.value),
        "created_at": item.updated_at.isoformat() if item.updated_at else "" if item.updated_at else "",
    }


@router.post("/generate")
def generate_token(
    session: Session = Depends(get_session),
    _admin=Depends(get_current_user),
):
    """生成新的永久密钥（自动替换旧的）"""
    new_token = uuid.uuid4().hex
    stmt = select(SiteConfig).where(SiteConfig.key == KEY)
    item = session.exec(stmt).first()
    if item:
        item.value = new_token
    else:
        item = SiteConfig(key=KEY, value=new_token, description="永久管理员密钥")
        session.add(item)
    session.commit()
    return {"token": new_token, "message": "新密钥已生成，旧密钥自动失效"}


@router.delete("")
def revoke_token(
    session: Session = Depends(get_session),
    _admin=Depends(get_current_user),
):
    """吊销永久密钥"""
    stmt = select(SiteConfig).where(SiteConfig.key == KEY)
    item = session.exec(stmt).first()
    if item:
        session.delete(item)
        session.commit()
    return {"message": "永久密钥已吊销"}


def verify_permanent_token(token: str, session: Session) -> bool:
    """验证是否为有效的永久密钥"""
    stmt = select(SiteConfig).where(SiteConfig.key == KEY)
    item = session.exec(stmt).first()
    if not item or not item.value:
        return False
    return token == (item.value if isinstance(item.value, str) else str(item.value))
