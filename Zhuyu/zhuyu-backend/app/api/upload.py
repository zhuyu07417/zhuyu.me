import uuid
from io import BytesIO

import oss2
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from PIL import Image

from app.deps import get_current_user
from app.config import (
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
    OSS_BUCKET_NAME,
    OSS_ENDPOINT,
    OSS_CUSTOM_DOMAIN,
    OSS_PREFIX,
)

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
MAX_SIZE = 10 * 1024 * 1024

def _get_bucket():
    auth = oss2.Auth(OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET)
    return oss2.Bucket(auth, OSS_ENDPOINT, OSS_BUCKET_NAME)


async def upload_image_bytes(content: bytes, content_type: str | None, filename: str | None = None) -> dict:
    """公共上传函数：传入文件字节，返回 {url, orientation}"""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"unsupported type: {content_type}")
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "max 10MB")

    orientation = "landscape"
    try:
        img = Image.open(BytesIO(content))
        w, h = img.size
        orientation = "landscape" if w >= h else "portrait"
    except Exception:
        pass

    ext = "webp"
    if filename and "." in filename:
        _ext = filename.rsplit(".", 1)[-1]
        if _ext.isascii() and _ext.isalnum():
            ext = _ext
    fname = f"{uuid.uuid4().hex}.{ext}"
    oss_key = f"{OSS_PREFIX}{fname}"

    bucket = _get_bucket()
    bucket.put_object(oss_key, content)

    url = f"{OSS_CUSTOM_DOMAIN}/{oss_key}"
    return {"url": url, "orientation": orientation}


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _: dict = Depends(get_current_user),
):
    content = await file.read()
    return await upload_image_bytes(content, file.content_type, file.filename)
