import os

"""音乐接口 —— 代理 NeteaseCloudMusicApi"""

import httpx
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import PlainTextResponse

router = APIRouter(prefix="/api/music", tags=["音乐"])

NETEASE_API = "http://127.0.0.1:3001"
SITE_URL = os.getenv("SITE_URL", "https://www.your-domain.com")


@router.get("")
async def get_music(
    id: str | None = Query(None, description="歌单ID"),
    ids: str | None = Query(None, description="歌曲ID,逗号分隔"),
):
    if not id and not ids:
        raise HTTPException(400, "需要提供 id (歌单ID) 或 ids (歌曲ID,逗号分隔)")

    async with httpx.AsyncClient(timeout=30) as client:
        if id:
            # 获取歌单详情
            resp = await client.get(f"{NETEASE_API}/playlist/detail", params={"id": id})
            if resp.status_code != 200:
                raise HTTPException(502, "获取歌单失败")
            data = resp.json()
            tracks = data.get("playlist", {}).get("tracks", [])

            # 批量获取播放地址
            track_ids = [str(t["id"]) for t in tracks]
            if track_ids:
                url_resp = await client.get(
                    f"{NETEASE_API}/song/url",
                    params={"id": ",".join(track_ids), "br": 320000},
                )
                url_data = {str(item["id"]): item for item in url_resp.json().get("data", [])}
            else:
                url_data = {}

            songs = []
            for t in tracks:
                tid = str(t["id"])
                url_info = url_data.get(tid, {})
                url = url_info.get("url", "")
                if not url:
                    continue
                url = url.replace("http://", "https://")
                cover = t.get("al", {}).get("picUrl", "")
                if cover:
                    cover = cover.replace("http://", "https://")
                artists = ", ".join(a.get("name", "") for a in t.get("ar", []))
                songs.append({
                    "id": tid,
                    "title": t.get("name", "未知歌曲"),
                    "artist": artists or "未知歌手",
                    "cover": cover,
                    "src": url,
                    "lrcUrl": f"{SITE_URL}/api/music/lyric?id={tid}",
                })
            return songs

        else:
            # 按歌曲ID获取
            id_list = [s.strip() for s in ids.split(",") if s.strip()]
            songs = []
            for song_id in id_list:
                try:
                    resp = await client.get(f"{NETEASE_API}/song/url", params={"id": song_id, "br": 320000})
                    url_data = resp.json().get("data", [{}])[0]
                    url = url_data.get("url", "")
                    if not url:
                        continue
                    url = url.replace("http://", "https://")

                    detail_resp = await client.get(f"{NETEASE_API}/song/detail", params={"ids": song_id})
                    detail = detail_resp.json().get("songs", [{}])[0]
                    cover = detail.get("al", {}).get("picUrl", "")
                    if cover:
                        cover = cover.replace("http://", "https://")
                    artists = ", ".join(a.get("name", "") for a in detail.get("ar", []))
                    songs.append({
                        "id": song_id,
                        "title": detail.get("name", "未知歌曲"),
                        "artist": artists or "未知歌手",
                        "cover": cover,
                        "src": url,
                        "lrcUrl": f"{SITE_URL}/api/music/lyric?id={song_id}",
                    })
                except Exception:
                    continue
            return songs


@router.get("/lyric", response_class=PlainTextResponse)
async def get_lyric(id: str = Query(..., description="歌曲ID")):
    """代理 netease-api 歌词接口，返回纯 LRC 文本"""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{NETEASE_API}/lyric", params={"id": id})
        if resp.status_code != 200:
            return ""
        data = resp.json()
        lrc_text = data.get("lrc", {}).get("lyric", "")
        return lrc_text or ""
