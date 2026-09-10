"""用户管理接口（管理员）"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from pydantic import BaseModel
from app.deps import get_session, get_current_user
from app.models.github_user import GitHubUser
from app.models.qq_user import QQUser

router = APIRouter(prefix="/api/admin/users", tags=["用户管理"])

@router.get("")
def list_users(session: Session = Depends(get_session), _admin=Depends(get_current_user)):
    users = []
    for u in session.exec(select(GitHubUser).order_by(GitHubUser.created_at.desc())).all():
        users.append({"id": u.id, "type": "github", "name": u.login, "avatar": u.avatar, "bio": u.bio or "", "created_at": u.created_at.isoformat() if u.created_at else ""})
    for u in session.exec(select(QQUser).order_by(QQUser.created_at.desc())).all():
        users.append({"id": u.id, "type": "qq", "name": u.nickname or "QQ用户", "avatar": u.avatar, "bio": "", "created_at": u.created_at.isoformat() if u.created_at else ""})
    return users

@router.get("/stats")
def user_stats(session: Session = Depends(get_session), _admin=Depends(get_current_user)):
    gh = session.exec(select(func.count(GitHubUser.id))).one()
    qq = session.exec(select(func.count(QQUser.id))).one()
    return {"github_count": gh, "qq_count": qq, "total": gh + qq}

@router.delete("/{user_type}/{user_id}")
def delete_user(user_type: str, user_id: int, session: Session = Depends(get_session), _admin=Depends(get_current_user)):
    if user_type == "github": user = session.get(GitHubUser, user_id)
    elif user_type == "qq": user = session.get(QQUser, user_id)
    else: raise HTTPException(400, "无效的用户类型")
    if not user: raise HTTPException(404, "用户不存在")
    session.delete(user)
    session.commit()
    return {"message": "用户已删除"}
