"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { getBookmarks } from "@/app/api";
import type { BookmarkCategory } from "@/app/api";

export default function BookmarkApp() {
  const [data, setData] = useState<BookmarkCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-400 text-sm">加载中...</div>;
  if (!data.length) return <div className="text-center py-8 text-slate-400 text-sm">暂无收藏</div>;

  return (
    <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto text-sm">
      {data.map((cat) => (
        <div key={cat.id}>
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{cat.name}</h3>
          <div className="space-y-1">
            {cat.sites.map((site) => (
              <a key={site.id} href={site.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group">
                <img src={site.icon || `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=32`}
                  className="w-4 h-4 rounded" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 truncate flex-1">{site.name}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
