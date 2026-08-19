"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { siteConfig } from "@/siteConfig";
import { getPosts, getChatters, type PostItem, type ChatterItem } from "@/app/api";

interface ActivityRecord {
  id: string;
  type: "文章" | "说说";
  title: string;
  date: string;
  url: string;
}

interface AboutTabsProps {
  contentHtml: string;
  coverImage: string;
}

function getLocalDateKey(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDateTime(dateStr).slice(0, 10);
}

export default function AboutTabs({ contentHtml, coverImage }: AboutTabsProps) {
  const [tab, setTab] = useState<"intro" | "activity">("intro");
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const heatmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab !== "activity" || activities.length > 0) return;
    setLoadingActivities(true);
    Promise.all([
      getPosts({ status: "published", page: 1, size: 50 }),
      getChatters({ status: "published", page: 1, size: 50 }),
    ])
      .then(([posts, chatters]) => {
        const postActs: ActivityRecord[] = (posts as PostItem[]).map((p) => ({
          id: `post-${p.id}`,
          type: "文章",
          title: p.title,
          date: p.published_at || p.created_at,
          url: `/posts/${p.slug}`,
        }));
        const chatterActs: ActivityRecord[] = (chatters as ChatterItem[]).map((c) => ({
          id: `chatter-${c.id}`,
          type: "说说",
          title: c.content.slice(0, 50) + (c.content.length > 50 ? "..." : ""),
          date: c.created_at,
          url: `/moments?onlyView=${c.id}`,
        }));
        const all = [...postActs, ...chatterActs].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setActivities(all);
      })
      .catch(() => {})
      .finally(() => setLoadingActivities(false));
  }, [tab, activities.length]);

  // 热力图数据
  const { weeks, activityMap } = useMemo(() => {
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeksArr: Date[][] = [];
    let currentWeek: Date[] = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      currentWeek.push(new Date(curr));
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
      curr.setDate(curr.getDate() + 1);
    }
    if (currentWeek.length > 0) weeksArr.push(currentWeek);

    const map: Record<string, number> = {};
    activities.forEach((a) => {
      const d = new Date(a.date);
      if (!isNaN(d.getTime())) {
        const key = getLocalDateKey(d);
        map[key] = (map[key] || 0) + 1;
      }
    });

    return { weeks: weeksArr, activityMap: map };
  }, [activities]);

  // 切到 activity 时滚动热力图到最右
  useEffect(() => {
    if (tab !== "activity") return;
    const checkAndScroll = setInterval(() => {
      if (heatmapRef.current) {
        heatmapRef.current.scrollLeft = heatmapRef.current.scrollWidth;
        clearInterval(checkAndScroll);
        setTimeout(() => {
          if (heatmapRef.current) heatmapRef.current.scrollLeft = heatmapRef.current.scrollWidth;
        }, 300);
      }
    }, 50);
    const timeout = setTimeout(() => clearInterval(checkAndScroll), 2000);
    return () => { clearInterval(checkAndScroll); clearTimeout(timeout); };
  }, [tab]);

  function getColorClass(count: number): string {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/50";
    if (count === 1) return "bg-green-300 dark:bg-green-900/80";
    if (count === 2) return "bg-green-400 dark:bg-green-700/80";
    if (count === 3) return "bg-green-500 dark:bg-green-600";
    return "bg-green-600 dark:bg-green-500";
  }

  function getTypeColor(type: string): string {
    switch (type) {
      case "文章": return "text-indigo-600 dark:text-indigo-400";
      case "说说": return "text-pink-600 dark:text-pink-400";
      default: return "text-slate-500 dark:text-slate-400";
    }
  }

  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden transition-colors duration-700 relative">

      {/* 封面 */}
      <div className="w-full h-40 sm:h-48 md:h-64 relative bg-slate-200 dark:bg-slate-700 overflow-hidden group">
        <img src={coverImage} alt="About Hero" className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      <div className="px-5 sm:px-8 md:px-16 pb-10 md:pb-16 relative">
        {/* 头像 */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden -mt-12 md:-mt-16 relative z-20 bg-white">
          <img src={siteConfig.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        </div>

        {/* 标题 + Tab（同一行，照搬参考项目） */}
        <div className="mt-4 md:mt-6 mb-6 md:mb-8 relative flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-1 md:mb-3 transition-colors duration-700">
              关于我
            </h1>
            <p className="text-sm md:text-lg text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase transition-colors duration-700">
              Hello World, I&apos;m {siteConfig.authorName}
            </p>
          </div>

          {/* 紧凑 Tab 按钮 */}
          <div className="flex items-center w-full md:w-auto gap-1 bg-white/50 dark:bg-slate-900/50 p-1 md:p-1.5 rounded-xl md:rounded-2xl shadow-inner border border-white/40 dark:border-white/5">
            <button
              onClick={() => setTab("intro")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all duration-300 ${
                tab === "intro" ? "bg-indigo-500 text-white shadow-md" : "text-slate-500 hover:text-indigo-500"
              }`}
            >
              自我介绍
            </button>
            <button
              onClick={() => setTab("activity")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all duration-300 ${
                tab === "activity" ? "bg-indigo-500 text-white shadow-md" : "text-slate-500 hover:text-indigo-500"
              }`}
            >
              研究动态
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-slate-300/50 dark:bg-slate-700 mb-6 md:mb-8" />

        {/* Tab 内容 */}
        <AnimatePresence mode="wait">
          {tab === "intro" ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <style>{`
                .prose h1 { font-size: 1.8rem !important; font-weight: 900 !important; margin-bottom: 1.2rem !important; margin-top: 2rem !important; line-height: 1.3 !important; color: inherit !important; }
                .prose h2 { font-size: 1.5rem !important; font-weight: 800 !important; margin-bottom: 1rem !important; margin-top: 1.5rem !important; color: inherit !important; }
                .prose h3 { font-size: 1.2rem !important; font-weight: 700 !important; margin-bottom: 0.8rem !important; color: inherit !important; }
                .prose p { font-size: 0.95rem !important; line-height: 1.75 !important; color: inherit !important; }
                .prose ul, .prose ol { padding-left: 1.2rem !important; font-size: 0.95rem !important; }
                .prose pre {
                  background-color: #282c34 !important; color: #abb2bf !important;
                  padding: 1rem !important; border-radius: 0.75rem !important;
                  overflow-x: auto !important; box-shadow: inset 0 0 10px rgba(0,0,0,0.3) !important;
                  margin-top: 1rem !important; margin-bottom: 1rem !important;
                }
                .prose pre code {
                  background-color: transparent !important; padding: 0 !important;
                  color: inherit !important; font-size: 0.85em !important;
                  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace !important;
                }
                .prose code::before, .prose code::after { content: none !important; }
                .prose p code, .prose li code {
                  background-color: rgba(99, 102, 241, 0.1) !important; color: #6366f1 !important;
                  padding: 0.1rem 0.3rem !important; border-radius: 0.25rem !important;
                  font-weight: 600 !important; font-size: 0.85em !important;
                }
                .dark .prose p code, .dark .prose li code {
                  background-color: rgba(99, 102, 241, 0.2) !important; color: #818cf8 !important;
                }
                .prose blockquote {
                  border-left: 4px solid #6366f1 !important; padding-left: 1rem !important;
                  margin: 1.5rem 0 !important; color: #64748b !important; font-style: italic !important;
                }
                .dark .prose blockquote { color: #94a3b8 !important; }
                .prose img {
                  display: block !important; margin: 1.5rem auto !important;
                  border-radius: 1rem !important; max-width: 100% !important; height: auto !important;
                }
                .prose a { color: #6366f1 !important; text-decoration: underline !important; text-underline-offset: 3px !important; }
                .dark .prose a { color: #818cf8 !important; }
                .prose strong { font-weight: 700 !important; }
                .prose pre code .hljs-comment { color: #5c6370 !important; font-style: italic !important; }
                .prose pre code .hljs-keyword { color: #c678dd !important; }
                .prose pre code .hljs-string { color: #98c379 !important; }
                .prose pre code .hljs-number { color: #d19a66 !important; }
                .prose pre code .hljs-title { color: #61aeee !important; }
                @media (min-width: 768px) {
                  .prose h1 { font-size: 3rem !important; margin-bottom: 2rem !important; margin-top: 3rem !important; }
                  .prose h2 { font-size: 2.2rem !important; }
                  .prose p { font-size: 1.15rem !important; }
                  .prose pre { padding: 1.25rem !important; }
                  .prose pre code { font-size: 0.9em !important; }
                }
              `}</style>
              <div
                className="prose prose-slate dark:prose-invert prose-base md:prose-lg max-w-none text-slate-800 dark:text-slate-200 transition-colors duration-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {loadingActivities ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* 热力图 */}
                  <div className="mb-12 p-5 md:p-8 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-inner">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <Activity size={20} className="text-green-500" />
                      {activities.length} contributions in the last year
                    </h3>

                    <div className="flex gap-2">
                      {/* 星期轴 */}
                      <div className="flex flex-col shrink-0">
                        <div className="h-4 mb-1" />
                        <div className="flex flex-col gap-[4px] text-[10px] text-slate-400">
                          <div className="h-[11px] md:h-[13px]" />
                          <div className="h-[11px] md:h-[13px] leading-none flex items-center">Mon</div>
                          <div className="h-[11px] md:h-[13px]" />
                          <div className="h-[11px] md:h-[13px] leading-none flex items-center">Wed</div>
                          <div className="h-[11px] md:h-[13px]" />
                          <div className="h-[11px] md:h-[13px] leading-none flex items-center">Fri</div>
                          <div className="h-[11px] md:h-[13px]" />
                        </div>
                      </div>

                      {/* 格子 */}
                      <div ref={heatmapRef} className="flex-1 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
                        <div className="min-w-[700px]">
                          {/* 月份标签 */}
                          <div className="flex gap-[4px] text-[10px] text-slate-400 mb-1 h-4">
                            {weeks.map((week, idx) => {
                              const firstDay = week[0];
                              const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                              return (
                                <div key={idx} className="w-[11px] md:w-[13px] shrink-0 relative">
                                  {isFirstWeekOfMonth && (
                                    <span className="absolute left-0 whitespace-nowrap z-10">
                                      {firstDay.toLocaleString("en-US", { month: "short" })}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* 格子 */}
                          <div className="flex gap-[4px]">
                            {weeks.map((week, i) => (
                              <div key={i} className="flex flex-col gap-[4px]">
                                {week.map((day, j) => {
                                  const dateKey = getLocalDateKey(day);
                                  const count = activityMap[dateKey] || 0;
                                  return (
                                    <div
                                      key={j}
                                      title={`${dateKey}: ${count} 次更新`}
                                      className={`w-[11px] h-[11px] md:w-[13px] md:h-[13px] rounded-[3px] transition-colors duration-300 hover:ring-2 hover:ring-indigo-500/50 ${getColorClass(count)}`}
                                    />
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 图例 */}
                    <div className="flex items-center justify-end gap-2 mt-2 text-[10px] md:text-xs font-bold text-slate-500">
                      Less
                      <div className="w-[11px] h-[11px] rounded-[3px] bg-slate-100 dark:bg-slate-800/50" />
                      <div className="w-[11px] h-[11px] rounded-[3px] bg-green-300 dark:bg-green-900/80" />
                      <div className="w-[11px] h-[11px] rounded-[3px] bg-green-400 dark:bg-green-700/80" />
                      <div className="w-[11px] h-[11px] rounded-[3px] bg-green-500 dark:bg-green-600" />
                      <div className="w-[11px] h-[11px] rounded-[3px] bg-green-600 dark:bg-green-500" />
                      More
                    </div>
                  </div>

                  {/* 时间线 */}
                  <div className="relative pl-6 md:pl-8 border-l-2 border-indigo-500/20 dark:border-indigo-400/20 space-y-6 md:space-y-8">
                    {activities.map((act, index) => {
                      const isMoment = act.type === "说说";
                      const targetUrl = isMoment ? "/moments" : act.url;

                      return (
                        <div key={act.id} className="relative group">
                          <div className="absolute -left-[31px] md:-left-[39px] top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-full group-hover:scale-125 transition-transform duration-300 z-10" />
                          <a
                            href={targetUrl}
                            className="flex flex-col md:flex-row md:items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-lg transition-all group-hover:-translate-y-1 cursor-pointer block relative overflow-hidden"
                          >
                            <div className="flex items-center gap-3 w-full md:w-auto">
                              <img src={siteConfig.avatarUrl} alt="author" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm shrink-0" />
                              <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{siteConfig.authorName}</span>
                                  <span className={`text-xs font-bold ${getTypeColor(act.type)}`}>
                                    {isMoment ? "发布了 说说" : `更新了 ${act.type}`}
                                  </span>
                                </div>
                                <div className="text-[10px] md:hidden font-mono text-slate-400 mt-0.5">
                                  {formatDateTime(act.date)}
                                </div>
                              </div>
                            </div>

                            {!isMoment && (
                              <>
                                <div className="hidden md:block w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm md:text-base font-black text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    《{act.title}》
                                  </div>
                                </div>
                              </>
                            )}

                            {isMoment && <div className="flex-1 hidden md:block" />}

                            <div className="hidden md:block text-[11px] font-mono text-slate-400 shrink-0 ml-auto bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded-md">
                              {formatDateTime(act.date)}
                            </div>
                          </a>
                        </div>
                      );
                    })}

                    {activities.length === 0 && (
                      <div className="text-slate-500 text-sm font-bold">暂无活动记录...</div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
