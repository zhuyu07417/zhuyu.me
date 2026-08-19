from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
import json

from app.deps import get_session
from app.schemas import SiteConfigUpdate, SiteConfigOut
from app.services import site_config_service
from app.deps import get_current_user
from app.api.upload import upload_image_bytes
from app.models.site_config import SiteConfig
from datetime import datetime

router = APIRouter(prefix="/api/site-config", tags=["站点配置"])

BG_IMAGES_KEY = "bg_images"


class SiteConfigCreate(BaseModel):
    key: str
    value: str = ""
    description: str = ""


# ---- 背景图管理辅助函数 ----

def _get_bg_images(session: Session) -> list[str]:
    try:
        row = site_config_service.get_config(session, BG_IMAGES_KEY)
        if isinstance(row, list):
            return row
        if isinstance(row, str):
            return json.loads(row)
        return []
    except Exception:
        return []


def _set_bg_images(session: Session, images: list[str]):
    row = session.exec(select(SiteConfig).where(SiteConfig.key == BG_IMAGES_KEY)).first()
    value = json.dumps(images, ensure_ascii=False)
    if not row:
        row = SiteConfig(key=BG_IMAGES_KEY, value=value, description="背景图URL列表")
    else:
        row.value = value
        row.description = "背景图URL列表"
        row.updated_at = datetime.now()
    session.add(row)
    session.commit()


# ---- 背景图管理路由（必须在 /{key} 之前注册） ----

@router.get("/bg-images/list")
def get_bg_images(session: Session = Depends(get_session)):
    return _get_bg_images(session)


@router.put("/bg-images")
def set_bg_images(
    images: list[str],
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    _set_bg_images(session, images)
    return {"ok": True, "images": images}


@router.post("/bg-images/upload")
async def upload_bg_image(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    content = await file.read()
    result = await upload_image_bytes(content, file.content_type, file.filename)
    url = result["url"]
    existing = _get_bg_images(session)
    existing.append(url)
    _set_bg_images(session, existing)
    return {"url": url, "images": existing}


@router.delete("/bg-images/{index}")
def delete_bg_image(
    index: int,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    existing = _get_bg_images(session)
    if index < 0 or index >= len(existing):
        raise HTTPException(400, "索引超出范围")
    existing.pop(index)
    _set_bg_images(session, existing)
    return {"ok": True, "images": existing}


# ---- 通用站点配置路由 ----

@router.get("")
def get_all_config(session: Session = Depends(get_session)):
    return site_config_service.get_all_config(session)


@router.get("/list")
def get_all_config_list(
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return site_config_service.get_all_config_list(session)


@router.get("/{key}")
def get_config(key: str, session: Session = Depends(get_session)):
    return site_config_service.get_config(session, key)


@router.post("", response_model=SiteConfigOut)
def create_config(
    data: SiteConfigCreate,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return site_config_service.create_config(session, data.key, data.value, data.description)


@router.put("/{key}", response_model=SiteConfigOut)
def update_config(
    key: str,
    data: SiteConfigUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return site_config_service.update_config(session, key, data)


@router.put("")
def batch_update_config(
    configs: dict,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    return site_config_service.batch_update_config(session, configs)


@router.delete("/{key}")
def delete_config(
    key: str,
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    site_config_service.delete_config(session, key)
    return {"ok": True}
