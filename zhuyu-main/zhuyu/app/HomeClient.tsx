"use client";

import dynamic from "next/dynamic";
import SearchBar from "@/components/ui/SearchBar";
import ProfileCard from "@/components/home/ProfileCard";
import FadeIn from "@/components/ui/FadeIn";

const CloudPlayer = dynamic(() => import("@/components/music/CloudPlayer"), { ssr: false });
const LyricBar = dynamic(() => import("@/components/music/LyricBar"), { ssr: false });
const LatestPostsCarousel = dynamic(() => import("@/components/home/LatestPostsCarousel"), { ssr: false });
const LatestChatterCarousel = dynamic(() => import("@/components/home/LatestChatterCarousel"), { ssr: false });
const PhotoWallPreview = dynamic(() => import("@/components/home/PhotoWallPreview"), { ssr: false });
const ThemeToggleBlock = dynamic(() => import("@/components/home/ThemeToggleBlock"), { ssr: false });
const SiteDashboard = dynamic(() => import("@/components/widgets/SiteDashboard"), { ssr: false });

export default function HomeClient({
  postCount,
  chatterCount,
  photoCount,
}: {
  postCount: number;
  chatterCount: number;
  photoCount: number;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto py-6 md:py-12 px-4 sm:px-10 relative z-10">
      {/* 搜索栏 */}
      <FadeIn>
        <div className="hidden md:block">
          <SearchBar />
        </div>
      </FadeIn>

      <main className="flex flex-col gap-4 md:gap-6 w-full">
        {/* 第一行：个人信息 + 播放器 */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 w-full items-stretch">
            <div className="md:col-span-8 flex w-full">
              <ProfileCard
                postCount={postCount}
                chatterCount={chatterCount}
                photoCount={photoCount}
              />
            </div>
            <div className="md:col-span-4 flex w-full">
              <CloudPlayer />
            </div>
          </div>
        </FadeIn>

        {/* 歌词栏 */}
        <FadeIn delay={0.15}>
          <div className="w-full">
            <LyricBar />
          </div>
        </FadeIn>

        {/* 第二行：文章 + 照片墙 + 说说 + 主题切换 */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 w-full items-stretch">
            <div className="md:col-span-4 h-full">
              <PhotoWallPreview />
            </div>
            <div className="md:col-span-8 flex flex-col gap-4 md:gap-6">
              <div className="min-h-[200px] sm:min-h-[220px]">
                <LatestChatterCarousel />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-[200px]">
                <div className="sm:col-span-2">
                  <LatestPostsCarousel />
                </div>
                <div className="sm:col-span-1 flex">
                  <ThemeToggleBlock />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 底部数据面板 */}
        <FadeIn delay={0.25}>
          <div className="w-full">
            <SiteDashboard />
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
