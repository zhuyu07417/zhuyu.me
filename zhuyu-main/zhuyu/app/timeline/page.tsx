"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, LayoutGrid, ListTree, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { getPosts, type PostItem } from "@/app/api";

function TimelineNode({ post, index }: { post: PostItem; index: number }) {
  const isLeft = index % 2 === 0;
  const dateStr = new Date(post.published_at || post.created_at).toLocaleDateString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`mb-12 flex justify-between items-center w-full ${isLeft ? "md:flex-row-reverse" : "flex-row"}`}
    >
      <div className="order-1 w-5/12 hidden md:block" />
      <div className="z-20 flex items-center justify-center order-1 bg-white dark:bg-slate-900 shadow-xl w-6 h-6 rounded-full border-4 border-indigo-400 ring-4 ring-indigo-200/50 dark:ring-indigo-900/30" />
      <Link href={`/posts/${post.slug}`} className="order-1 w-full md:w-5/12 group">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-3xl shadow-lg border border-white/60 dark:border-white/10 transition-all duration-500 hover:scale-[1.03] hover:bg-white/70 dark:hover:bg-slate-800/70 hover:shadow-2xl overflow-hidden flex flex-col">
          <div className="w-full h-40 sm:h-48 overflow-hidden relative bg-slate-200 dark:bg-slate-700">
            {post.cover ? (
              <img src={post.cover} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Clock className="w-12 h-12 text-indigo-300 dark:text-indigo-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center gap-1 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />{dateStr}
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">{post.title}</h3>
            {post.category && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 border border-indigo-500/10 dark:border-indigo-400/10">#{post.category}</span>
              </div>
            )}
            {post.description && <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">{post.description}</p>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TimelinePage() {
  const [allPosts, setAllPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "card">("timeline");

  useEffect(() => {
    getPosts({ status: "published", page: 1, size: 200 }).then(setAllPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const enforce = () => { if (window.innerWidth < 768) setViewMode("card"); };
    enforce();
    window.addEventListener("resize", enforce);
    return () => window.removeEventListener("resize", enforce);
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    allPosts.forEach((p) => { if (p.category) map.set(p.category, (map.get(p.category) || 0) + 1); });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((p) => {
      const matchTag = selectedTag === "All" || p.category === selectedTag;
      const matchSearch = !searchQuery.trim() || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTag && matchSearch;
    });
  }, [allPosts, selectedTag, searchQuery]);

  const sorted = useMemo(() => [...filteredPosts].sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime()), [filteredPosts]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-28 px-4 sm:px-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">归档</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2 italic"><Sparkles size={16} className="text-indigo-500" /> 加载中...</p>
        </div>
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-28 px-4 sm:px-10 relative z-10">
      <div className="text-center mb-12 relative z-20">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">归档</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2 italic"><Sparkles size={16} className="text-indigo-500" /> 总计 {allPosts.length} 篇文章</p>
      </div>

      <div className="flex flex-col items-center gap-8 mb-16 relative z-[99]">
        <div className="relative w-full max-w-lg group">
          <input type="text" placeholder="搜索文章..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl px-6 py-4 pl-14 text-slate-800 dark:text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-400 font-medium" />
          <Search className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md p-4 rounded-3xl border border-white/20 dark:border-white/5">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 flex-1">
            <button onClick={() => setSelectedTag("All")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${selectedTag === "All" ? "bg-indigo-500 text-white shadow-md" : "bg-white/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-white"}`}>全部</button>
            {categories.map((cat) => (
              <button key={cat.name} onClick={() => setSelectedTag(cat.name)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${selectedTag === cat.name ? "bg-indigo-500 text-white shadow-md" : "bg-white/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-white"}`}>{cat.name} <span className="opacity-50 ml-1">{cat.count}</span></button>
            ))}
          </div>
          <div className="hidden md:flex bg-white/50 dark:bg-slate-900/50 p-1 rounded-2xl shadow-inner shrink-0">
            <button onClick={() => setViewMode("timeline")} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${viewMode === "timeline" ? "bg-white dark:bg-slate-700 text-indigo-500 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}><ListTree size={16} /><span>中枢链路</span></button>
            <button onClick={() => setViewMode("card")} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${viewMode === "card" ? "bg-white dark:bg-slate-700 text-indigo-500 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}><LayoutGrid size={16} /><span>矩阵网格</span></button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "timeline" && (
          <motion.div key="timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="relative overflow-hidden p-2 md:p-10 min-h-[500px]">
            <div className="absolute border-opacity-20 border-indigo-500 dark:border-indigo-400/20 h-full border-2 left-1/2 transform -translate-x-1/2 rounded-full" />
            <div className="relative z-10 flex flex-col gap-16">
              {sorted.map((post, index) => <TimelineNode key={post.id} post={post} index={index + 1} />)}
              {sorted.length === 0 && <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold tracking-widest text-sm">暂无匹配的文章</div>}
            </div>
          </motion.div>
        )}
        {viewMode === "card" && (
          <motion.div key="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 pt-4 pb-10">
              {sorted.map((post, idx) => (
                <motion.div key={post.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                  <Link href={`/posts/${post.slug}`} className="block">
                    <div className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg flex flex-col h-full group hover:-translate-y-1 transition-transform duration-300">
                      <div className="relative h-28 sm:h-36 md:h-40 overflow-hidden">
                        {post.cover ? <img src={post.cover} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center"><Clock className="w-8 h-8 text-indigo-300 dark:text-indigo-600" /></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-2 left-2 md:bottom-3 md:left-4 text-white/90 text-[9px] md:text-xs font-mono font-bold bg-black/40 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded flex items-center gap-1"><Calendar size={10} className="md:w-3 md:h-3" />{new Date(post.published_at || post.created_at).toLocaleDateString("zh-CN")}</span>
                      </div>
                      <div className="p-3 md:p-5 flex-1 flex flex-col">
                        <h3 className="text-xs sm:text-sm md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2 line-clamp-2 transition-colors group-hover:text-indigo-500">{post.title}</h3>
                        <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-2 md:mb-4 line-clamp-2 flex-1 leading-snug">{post.description || "暂无描述"}</p>
                        {post.category && <span className="text-[8px] md:text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded self-start">#{post.category}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
