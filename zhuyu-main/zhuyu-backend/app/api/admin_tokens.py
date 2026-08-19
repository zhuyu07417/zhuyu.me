"""管理员Token管理接口"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.deps import get_session, get_current_user
from app.models.site_config import SiteConfig

router = APIRouter(prefix="/api/admin/tokens", tags=["Token管理"])

class TokenRevokeRequest(BaseModel):
    jti: str

@router.get("")
def list_tokens(session: Session = Depends(get_session), _admin=Depends(get_current_user)):
    stmt = select(SiteConfig).where(SiteConfig.key.startswith("admin_token_"))
    items = session.exec(stmt).all()
    tokens = []
    for item in items:
        jti = item.key.replace("admin_token_", "")
        data = item.value if isinstance(item.value, str) else str(item.value)
        parts = data.split("|")
        tokens.append({"jti": jti, "username": parts[0] if len(parts)>0 else "", "ip": parts[1] if len(parts)>1 else "", "revoked": parts[2]=="true" if len(parts)>2 else False, "created_at": item.created_at.isoformat() if item.created_at else ""})
    tokens.sort(key=lambda x: x["created_at"], reverse=True)
    return tokens

@router.post("/revoke")
def revoke_token(body: TokenRevokeRequest, session: Session = Depends(get_session), _admin=Depends(get_current_user)):
    key = f"admin_token_{body.jti}"
    stmt = select(SiteConfig).where(SiteConfig.key == key)
    item = session.exec(stmt).first()
    if not item: raise HTTPException(404, "Token不存在")
    data = item.value if isinstance(item.value, str) else str(item.value)
    parts = data.split("|")
    if len(parts) >= 3: parts[2] = "true"
    else: parts.extend(["", "true"])
    item.value = "|".join(parts)
    session.add(item); session.commit()
    return {"message": "已吊销"}

@router.delete("/{jti}")
def delete_token(jti: str, session: Session = Depends(get_session), _admin=Depends(get_current_user)):
    key = f"admin_token_{jti}"
    stmt = select(SiteConfig).where(SiteConfig.key == key)
    item = session.exec(stmt).first()
    if not item: raise HTTPException(404, "Token不存在")
    session.delete(item); session.commit()
    return {"message": "已删除"}
