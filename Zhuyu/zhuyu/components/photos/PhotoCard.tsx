"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Photo } from "@/data/photos";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  onClick: () => void;
}

export default function PhotoCard({ photo, index, onClick }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false);

  const rotation = useMemo(() => {
    const seed = photo.id.charCodeAt(0) + photo.id.charCodeAt(photo.id.length - 1);
    return ((seed % 7) - 3) * 0.8;
  }, [photo.id]);

  const isLandscape = photo.orientation === "landscape";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotation * 2 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: "easeOut",
      }}
      whileHover={{
        rotate: 0,
        scale: 1.03,
        zIndex: 10,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      onClick={onClick}
      className="relative cursor-pointer group break-inside-avoid mb-3 md:mb-5"
      style={{ transformOrigin: "center center" }}
    >
      {/* 照片外框 */}
      <div className="relative bg-white dark:bg-slate-800 p-2 pb-6 md:p-2.5 md:pb-8 rounded-sm shadow-lg dark:shadow-black/30 group-hover:shadow-2xl transition-shadow duration-300">
        {/* 照片 */}
        <div className={`relative overflow-hidden rounded-[1px] ${isLandscape ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
          {/* OSS缩略图 + 模糊占位过渡 */}
          <img
            src={`${photo.url}?x-oss-process=image/resize,w_200/quality,q_30`}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
            style={{ filter: "blur(12px)", transform: "scale(1.05)" }}
          />
          <Image
            src={`${photo.url}?x-oss-process=image/resize,w_400/quality,q_80`}
            alt={photo.caption || "照片"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className={`object-cover transition-opacity duration-700 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* caption */}
        {photo.caption && (
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-serif italic tracking-wide">
              {photo.caption}
            </span>
          </div>
        )}
      </div>

      {/* 胶带装饰 */}
      <div
        className="absolute -top-2 left-2 md:left-3 w-8 h-3 md:w-10 md:h-4 bg-amber-200/60 dark:bg-amber-300/30 rounded-sm rotate-[-6deg] pointer-events-none"
        style={{ backdropFilter: "blur(2px)" }}
      />
    </motion.div>
  );
}
