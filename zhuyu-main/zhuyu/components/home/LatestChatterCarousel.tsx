"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart } from "lucide-react";
import { getChatters, getAlbums, getAlbumPhotos } from "@/app/api";
import type { ChatterItem } from "@/app/api";

function relativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return dateStr.replace("T", " ").slice(5, 16);
}

export default function LatestChatterCarousel() {
  const router = useRouter();
  const [items, setItems] = useState<ChatterItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bgPhotos, setBgPhotos] = useState<string[]>([]);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    getChatters({ status: "published", page: 1, size: 5 })
      .then((data) => {
        if (!data.length) return;
        setItems(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getAlbums()
      .then(async (albums) => {
        const photos: string[] = [];
        for (const title of ["2"]) {
          const album = albums.find((a) => a.title === title);
          if (album) {
            const data = await getAlbumPhotos(album.id);
            if (data?.length) photos.push(...data.map((p) => p.url));
          }
        }
        setBgPhotos(photos);
      })
      .catch(() => {});
  }, []);

  // 轮播已关闭，只通过指示器手动切换

  useEffect(() => {
    if (bgPhotos.length === 0) return;
    setBgIndex(Math.floor(Math.random() * bgPhotos.length));
  }, [currentIndex, bgPhotos.length]);

  if (!items.length) {
    return (
      <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl min-h-[160px] md:min-h-[220px] flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
        <MessageSquare className="w-10 h-10 opacity-40" />
        <span className="text-sm">暂无说说</span>
      </div>
    );
  }

  const current = items[currentIndex];
  const bgUrl = bgPhotos.length > 0 ? bgPhotos[bgIndex] : null;

  return (
    <div
      className="w-full h-full rounded-3xl overflow-hidden relative min-h-[160px] md:min-h-[220px] select-none cursor-pointer"
      onClick={() => router.push(`/moments?onlyView=${current.id}`)}
    >
      <AnimatePresence>
        {bgUrl && (
          <motion.div key={bgUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0">
            <img src={bgUrl} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg p-4 md:p-6 flex flex-col justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {current.mood && <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm">{current.mood}</span>}
              <span className="text-xs text-white/60">{relativeTime(current.created_at)}</span>
            </div>
            <p className="text-sm md:text-base text-white leading-relaxed line-clamp-4 font-medium drop-shadow-lg">{current.content}</p>
            {current.images && current.images.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {current.images.slice(0, 3).map((img, i) => (
                  <div key={i} className="w-20 h-16 rounded-xl overflow-hidden border border-white/20 shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {current.images.length > 3 && (
                  <div className="w-20 h-16 rounded-xl bg-white/20 flex items-center justify-center text-white/70 text-xs font-bold shrink-0">
                    +{current.images.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-white/70"><Heart className="w-3.5 h-3.5" /><span>{current.likes}</span></div>
          </div>
          {items.length > 1 && (
            <div className="absolute bottom-4 right-5 z-30 flex gap-2">
              {items.map((_, i) => (
                <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? "w-6 bg-[#520de7]" : "w-2 bg-white/40 hover:bg-white/80"}`} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
