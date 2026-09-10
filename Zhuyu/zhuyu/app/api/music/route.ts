import { NextRequest, NextResponse } from "next/server";

interface SongData {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  lrcUrl: string;
}

interface MetingTrack {
  id?: string;
  name: string;
  artist: string | string[];
  url: string;
  pic: string;
  lrc: string;
}

const METING_PROXY = "https://api.injahow.cn/meting";

async function fetchMeting(params: Record<string, string>): Promise<MetingTrack[]> {
  const qs = new URLSearchParams({ server: "netease", ...params });
  const res = await fetch(`${METING_PROXY}/?${qs}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`Meting proxy returned ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

function toHttps(url: string): string {
  return url ? url.replace(/^http:\/\//, "https://") : "";
}

async function resolveAudioUrl(proxyUrl: string): Promise<string> {
  if (!proxyUrl || !proxyUrl.includes("api.injahow.cn")) return proxyUrl;
  try {
    const res = await fetch(proxyUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const finalUrl = res.url;
    if (finalUrl && finalUrl !== proxyUrl && !finalUrl.includes("api.injahow.cn")) {
      return toHttps(finalUrl);
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("json")) {
      const data = await res.json();
      if (data.url) return toHttps(data.url);
    }
    return proxyUrl;
  } catch {
    return proxyUrl;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("id");
  const songIds = searchParams.get("ids");

  if (!playlistId && !songIds) {
    return NextResponse.json(
      { error: "需要提供 id (歌单ID) 或 ids (歌曲ID,逗号分隔)" },
      { status: 400 }
    );
  }

  try {
    let tracks: MetingTrack[] = [];
    if (playlistId) {
      tracks = await fetchMeting({ type: "playlist", id: playlistId });
    } else if (songIds) {
      const ids = songIds.split(",").map((s) => s.trim()).filter(Boolean);
      const results = await Promise.all(
        ids.map(async (id) => {
          try { return await fetchMeting({ type: "song", id }); } catch { return []; }
        })
      );
      tracks = results.flat();
    }

    const resolvedTracks = await Promise.all(
      tracks.map(async (track, index) => {
        const id = track.id || String(index);
        const src = await resolveAudioUrl(toHttps(track.url || ""));
        const cover = toHttps(track.pic || "");
        const lrcUrl = track.lrc ? toHttps(track.lrc) : "";
        return {
          id,
          title: track.name || "未知歌曲",
          artist: Array.isArray(track.artist) ? track.artist.join(", ") : String(track.artist || "未知歌手"),
          cover,
          src,
          lrcUrl,
        };
      })
    );

    return NextResponse.json(resolvedTracks.filter((s) => s.src && !s.src.includes("null")));
  } catch (err) {
    console.error("Meting proxy error:", err);
    return NextResponse.json({ error: "获取音乐数据失败" }, { status: 500 });
  }
}
