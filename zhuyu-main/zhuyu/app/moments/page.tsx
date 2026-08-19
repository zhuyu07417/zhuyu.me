"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Heart, ChevronLeft, Send, Reply, LogOut,
  ChevronDown, ChevronUp, Clock, MapPin, Sparkles, Search,
  ArrowDownAZ, ArrowUpZA, Ghost, X,
} from "lucide-react";
import {
  getChatters, getChatterComments, createChatterComment, likeChatter,
  likeChatterComment,
  type ChatterItem, type ChatterCommentItem,
} from "@/app/api";
import { getGithubUser } from "@/app/api/messages";
import type { GitHubUser } from "@/app/api/types";
import { siteConfig } from "@/siteConfig";

interface Moment {
  id: string;
  content: string;
  images: string[];
  mood: string;
  likes: number;
  comments_count: number;
  created_at: string;
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function QQIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.395 1.025.19 0 .46-.31.762-.865.15.4.443.998.863 1.518-.37.165-.636.4-.636.725 0 .5.643.725 1.525.725.565 0 1.077-.11 1.477-.3.398.23.876.39 1.408.455A5.6 5.6 0 0012.003 22c1.61 0 3.077-.515 4.016-1.335.38.065.75.13 1.083.13.88 0 1.257-.34 1.257-.71 0-.3-.22-.515-.57-.69.39-.5.65-1.09.78-1.49.31.56.58.875.78.875.235 0 .415-.38.415-1.05 0-2.52-2.162-6.947-2.162-6.947.86-3.48 1.328-5.175-.237-5.175z" />
    </svg>
  );
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function flattenReplies(
  replies: ChatterCommentItem[],
  parentMap?: Map<number, string>
): (ChatterCommentItem & { replyToUser?: string })[] {
  const map = parentMap ?? new Map<number, string>();
  const result: (ChatterCommentItem & { replyToUser?: string })[] = [];
  for (const r of replies) {
    const replyToUser = map.get(r.parent_id!);
    result.push(replyToUser ? { ...r, replyToUser } : r);
    if (r.replies?.length) {
      map.set(r.id, r.github_user?.login ?? "匿名用户");
      result.push(...flattenReplies(r.replies, map));
    }
  }
  return result;
}

interface LoginUser {
  login: string;
  avatar: string;
  type?: "github" | "qq";
}

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [onlyViewId, setOnlyViewId] = useState<string | null>(() => searchParams.get("onlyView"));
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("liked_chatters");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  // 评论相关
  const [user, setUser] = useState<LoginUser | null>(() => {
    if (typeof window === "undefined") return null;
    const gh = localStorage.getItem("github_user");
    if (gh) { try { return JSON.parse(gh); } catch { /* ignore */ } }
    const qq = localStorage.getItem("qq_user");
    if (qq) { try { return JSON.parse(qq); } catch { /* ignore */ } }
    return null;
  });
  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatterCommentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, ChatterCommentItem[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("liked_chatter_comments");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 恢复登录状态
  useEffect(() => {
    if (user) return;
    const ghToken = localStorage.getItem("github_token");
    if (ghToken) {
      getGithubUser(ghToken)
        .then((u) => { const u2 = { ...u, type: "github" as const }; setUser(u2); localStorage.setItem("github_user", JSON.stringify(u2)); })
        .catch(() => { localStorage.removeItem("github_token"); localStorage.removeItem("github_user"); });
      return;
    }
    const qqUser = localStorage.getItem("qq_user");
    if (qqUser) {
      try { setUser(JSON.parse(qqUser)); } catch { /* ignore */ }
    }
  }, []);

  // 加载说说
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getChatters({ status: "published", page: 1, size: 50 });
        if (!active) return;
        setMoments(data.map((item: ChatterItem) => ({
          id: String(item.id),
          content: item.content,
          images: item.images || [],
          mood: item.mood || "",
          likes: item.likes,
          comments_count: item.comments_count,
          created_at: item.created_at,
        })));
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, []);

  // 处理搜索和排序
  const processedMoments = useMemo(() => {
    let result = [...moments];
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(m => m.content.toLowerCase().includes(query));
    }
    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
    return result;
  }, [moments, searchQuery, sortOrder]);

  // onlyViewId 时自动加载评论
  useEffect(() => {
    if (!onlyViewId) return;
    const cid = parseInt(onlyViewId);
    if (isNaN(cid) || commentsMap[onlyViewId]) return;
    setCommentsLoading((p) => ({ ...p, [onlyViewId]: true }));
    getChatterComments(cid)
      .then((data) => setCommentsMap((p) => ({ ...p, [onlyViewId]: data })))
      .catch(() => {})
      .finally(() => setCommentsLoading((p) => ({ ...p, [onlyViewId]: false })));
  }, [onlyViewId, commentsMap]);

  async function toggleLike(id: string) {
    const chatterId = parseInt(id);
    if (isNaN(chatterId)) return;
    const alreadyLiked = likedIds.has(id);
    try {
      const result = await likeChatter(chatterId, alreadyLiked);
      setLikedIds((p) => {
        const n = new Set(p);
        if (alreadyLiked) n.delete(id); else n.add(id);
        localStorage.setItem("liked_chatters", JSON.stringify([...n]));
        return n;
      });
      setMoments((p) => p.map((m) => m.id === id ? { ...m, likes: result.likes } : m));
    } catch {}
  }

  function handleGithubLogin() { sessionStorage.setItem("github_redirect", window.location.pathname); window.location.href = "/api/auth/github/login?redirect=" + encodeURIComponent(window.location.pathname); }
  function handleQQLogin() { sessionStorage.setItem("github_redirect", window.location.pathname); window.location.href = "/api/auth/qq/login?redirect=" + encodeURIComponent(window.location.pathname); }
  function handleLogout() {
    localStorage.removeItem("github_token"); localStorage.removeItem("github_user");
    localStorage.removeItem("qq_token"); localStorage.removeItem("qq_user");
    setUser(null);
  }
  function cancelReply() { setReplyTo(null); setCommentInput(""); }

  async function handleCommentLike(commentId: number) {
    const alreadyLiked = likedCommentIds.has(commentId);
    try {
      const updated = await likeChatterComment(commentId, alreadyLiked);
      setLikedCommentIds((p) => {
        const n = new Set(p);
        if (alreadyLiked) n.delete(commentId); else n.add(commentId);
        localStorage.setItem("liked_chatter_comments", JSON.stringify([...n]));
        return n;
      });
      setCommentsMap((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = next[key].map((c) => updateCommentLikes(c, commentId, updated.likes));
        }
        return next;
      });
    } catch {}
  }

  function updateCommentLikes(c: ChatterCommentItem, targetId: number, likes: number): ChatterCommentItem {
    if (c.id === targetId) return { ...c, likes };
    if (c.replies?.length) return { ...c, replies: c.replies.map((r) => updateCommentLikes(r, targetId, likes)) };
    return c;
  }

  function startReply(c: ChatterCommentItem) { setReplyTo(c); setCommentInput(""); setTimeout(() => inputRef.current?.focus(), 100); }

  function findTopLevelId(comments: ChatterCommentItem[], targetId: number): number | null {
    for (const c of comments) {
      if (c.id === targetId) return c.id;
      for (const r of c.replies ?? []) { if (r.id === targetId) return c.id; for (const rr of r.replies ?? []) { if (rr.id === targetId) return c.id; } }
    }
    return null;
  }

  async function handleSubmitComment(chatterId: number) {
    if (!commentInput.trim() || submitting || !user) return;
    setSubmitting(true);
    try {
      const nc = await createChatterComment({ chatter_id: chatterId, content: commentInput.trim(), parent_id: replyTo?.id });
      const sid = String(chatterId);
      if (replyTo) {
        const pid = findTopLevelId(commentsMap[sid] ?? [], replyTo.id) ?? replyTo.id;
        setCommentsMap((p) => ({ ...p, [sid]: (p[sid] ?? []).map((c) => c.id === pid ? { ...c, replies: [...c.replies, nc] } : c) }));
        setExpandedReplies((p) => new Set([...p, pid]));
      } else {
        setCommentsMap((p) => ({ ...p, [sid]: [...(p[sid] ?? []), nc] }));
      }
      setMoments((p) => p.map((m) => m.id === sid ? { ...m, comments_count: m.comments_count + 1 } : m));
      setCommentInput(""); setReplyTo(null);
    } catch { alert("发送失败"); } finally { setSubmitting(false); }
  }

  // 渲染图片网格
  function renderImages(images: string[], momentId: string) {
    if (!images || images.length === 0) return null;
    const count = images.length;
    if (count === 1) {
      return (
        <div className="mt-4 flex justify-center w-full">
          <div onClick={() => setLightbox({ images, index: 0 })} className="max-w-[280px] overflow-hidden rounded-xl border border-slate-200/50 dark:border-white/10 shadow-lg cursor-zoom-in group">
            <img src={images[0]} alt="" className="w-full h-auto max-h-[300px] object-contain group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      );
    }
    const columns = count === 4 ? 2 : 3;
    const maxWidth = count === 4 ? "210px" : "320px";
    return (
      <div className="w-full flex justify-center mt-4">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, width: "100%", maxWidth }}>
          {images.slice(0, 9).map((src, idx) => (
            <div key={idx} onClick={() => setLightbox({ images, index: idx })} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-200/20 dark:bg-slate-700/20 border border-slate-200/50 dark:border-white/10 cursor-zoom-in">
              <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {idx === 8 && count > 9 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white backdrop-blur-[2px]">
                  <span className="text-lg font-black">+{count - 9}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 渲染单条说说卡片
  function renderMomentCard(moment: Moment) {
    const isOnlyView = onlyViewId === moment.id;
    return (
      <motion.div
        key={moment.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        className="flex flex-col bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 dark:border-white/10 p-5 md:p-8 transition-shadow hover:shadow-xl overflow-hidden relative group w-full"
      >
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-sm border-2 border-white dark:border-slate-700">
            <img src={siteConfig.avatarUrl || "/images/hong.jpg"} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-[#576b95] dark:text-[#7f99cc] tracking-wide">{siteConfig.authorName}</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
              <Clock size={10} /> {timeAgo(moment.created_at)}
            </div>
          </div>
          {moment.mood && <span className="ml-auto text-sm">{moment.mood}</span>}
        </div>

        {/* 内容 */}
        <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium break-words">{moment.content}</p>

        {/* 图片 */}
        {renderImages(moment.images, moment.id)}

        {/* 底部栏 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => toggleLike(moment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${likedIds.has(moment.id) ? "text-pink-500" : "text-slate-400 hover:text-pink-500"}`}>
              <Heart className={`w-4 h-4 transition-all duration-300 ${likedIds.has(moment.id) ? "fill-pink-500 scale-110" : ""}`} />
              <span>{moment.likes}</span>
            </button>

          </div>
          <button type="button" onClick={() => setOnlyViewId(isOnlyView ? null : moment.id)}
            className={`w-9 h-9 flex items-center justify-center shrink-0 rounded-full transition-all shadow-sm ${isOnlyView ? "bg-indigo-500 text-white shadow-indigo-500/30 rotate-12" : "bg-white/80 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
            <MessageSquare size={14} />
          </button>
        </div>

        {/* 评论区 */}
        <AnimatePresence>
          {isOnlyView && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                {/* 登录区 */}
                {user ? (
                  <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-xl bg-white/40 dark:bg-slate-700/30">
                    <img src={user.avatar} alt={user.login} className="w-6 h-6 rounded-full" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">{user.login}</span>
                    {user.type === "qq" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">QQ</span>}
                    <button type="button" onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 transition-colors">
                      <LogOut className="w-3 h-3" />退出
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mb-3">
                    <button type="button" onClick={handleGithubLogin}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/40 dark:bg-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-700/50 transition-all">
                      <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                        <GithubIcon className="w-3.5 h-3.5 text-white dark:text-slate-900" />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">GitHub 登录</span>
                    </button>
                    <button type="button" onClick={handleQQLogin}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/40 dark:bg-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-700/50 transition-all">
                      <div className="w-6 h-6 rounded-full bg-[#12B7F5] flex items-center justify-center">
                        <QQIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">QQ 登录</span>
                    </button>
                  </div>
                )}

                {/* 输入框 */}
                <div className="rounded-xl bg-white/40 dark:bg-slate-700/30 overflow-hidden mb-3">
                  <AnimatePresence>
                    {replyTo && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="flex items-center gap-1.5 px-2 pt-2 pb-0 text-[10px] text-slate-500 dark:text-slate-400">
                          <Reply className="w-3 h-3" />
                          <span>回复 <span className="font-medium text-sky-600 dark:text-sky-400">{replyTo.github_user?.login ?? "匿名"}</span></span>
                          <span className="truncate flex-1 opacity-60 ml-1">{replyTo.content.slice(0, 40)}</span>
                          <button type="button" onClick={cancelReply} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">✕</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="p-2">
                    <textarea ref={inputRef} value={commentInput} onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={user ? "说点什么..." : "登录后即可评论..."} disabled={!user} rows={2}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitComment(parseInt(moment.id)); }}
                      className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none outline-none disabled:cursor-not-allowed disabled:opacity-50" />
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/30 dark:border-white/5">
                      <span className="text-[10px] text-slate-400">Ctrl + Enter 发送</span>
                      <button type="button" onClick={() => handleSubmitComment(parseInt(moment.id))}
                        disabled={!user || !commentInput.trim() || submitting}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500 text-white text-[10px] font-medium hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                        <Send className="w-3 h-3" />{submitting ? "发送中..." : replyTo ? "回复" : "发送"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 评论列表 */}
                {commentsLoading[moment.id] && (
                  <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-10 rounded-xl bg-white/30 dark:bg-slate-700/20 animate-pulse" />)}</div>
                )}
                {!commentsLoading[moment.id] && (commentsMap[moment.id]?.length ?? 0) > 0 && (
                  <div className="space-y-2">
                    {commentsMap[moment.id].map((comment) => (
                      <CommentCard key={comment.id} comment={comment} expandedReplies={expandedReplies}
                        onReply={startReply}
                        onToggleReplies={(id) => setExpandedReplies((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
                        likedCommentIds={likedCommentIds} onCommentLike={handleCommentLike} />
                    ))}
                  </div>
                )}
                {!commentsLoading[moment.id] && !commentsMap[moment.id]?.length && (
                  <p className="text-center text-[10px] text-slate-400 py-2">暂无评论</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // 灯箱导航
  function nextImg(e: React.MouseEvent) {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });
  }
  function prevImg(e: React.MouseEvent) {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length });
  }

  if (loading) {
    return (
      <div className="w-[95%] md:w-[90%] max-w-6xl mx-auto py-6 md:py-10 mt-24 md:mt-28">
        <div className="mb-8 md:mb-14 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 tracking-tighter">生活动态</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium italic opacity-80 flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-indigo-500" /> &ldquo; 在代码之外捕捉瞬间的温度 &rdquo;
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-5 md:gap-8">
          <div className="flex-1 flex flex-col gap-5 md:gap-8">{[1, 2].map((i) => <div key={i} className="h-40 rounded-3xl bg-white/40 dark:bg-slate-800/40 animate-pulse" />)}</div>
          <div className="flex-1 flex flex-col gap-5 md:gap-8">{[3, 4].map((i) => <div key={i} className="h-40 rounded-3xl bg-white/40 dark:bg-slate-800/40 animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[95%] md:w-[90%] max-w-6xl mx-auto py-6 md:py-10 mt-24 md:mt-28 relative z-10 flex-1 flex flex-col min-h-[85vh]">
      {/* 标题 */}
      <div className="mb-8 md:mb-14 text-center">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 tracking-tighter">生活动态</motion.h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium italic opacity-80 flex items-center justify-center gap-2">
          <Sparkles size={12} className="text-indigo-500" /> &ldquo; 在代码之外捕捉瞬间的温度 &rdquo;
        </p>
      </div>

      {/* 返回全部 */}
      {onlyViewId && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} type="button" onClick={() => setOnlyViewId(null)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-500 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" />返回全部
        </motion.button>
      )}

      {/* 搜索 + 排序 */}
      {!onlyViewId && (
        <div className="mb-10 md:mb-16 flex flex-col items-center gap-5 md:gap-8">
          <div className="relative w-full max-w-lg group px-2 md:px-0">
            <Search className="w-5 h-5 md:w-6 md:h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-20 pointer-events-none" />
            <input type="text" placeholder="搜寻被遗忘的记忆..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-xl md:rounded-2xl px-5 py-3 md:py-4 pl-12 md:pl-14 text-sm md:text-base text-slate-800 dark:text-white shadow-lg md:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
          </div>
          <div className="flex bg-white/50 dark:bg-slate-800/50 p-1 md:p-1.5 rounded-xl border border-white/50 dark:border-white/10 shadow-sm">
            <button onClick={() => setSortOrder("desc")} className={`flex items-center gap-1.5 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all duration-300 ${sortOrder === "desc" ? "bg-indigo-500 text-white shadow-md scale-105" : "text-slate-500 hover:text-indigo-500"}`}>
              <ArrowDownAZ size={12} /> 最新
            </button>
            <button onClick={() => setSortOrder("asc")} className={`flex items-center gap-1.5 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all duration-300 ${sortOrder === "asc" ? "bg-indigo-500 text-white shadow-md scale-105" : "text-slate-500 hover:text-indigo-500"}`}>
              <ArrowUpZA size={12} /> 最早
            </button>
          </div>
        </div>
      )}

      {/* 双列瀑布流 */}
      {processedMoments.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 pb-32 w-full items-start">
          <div className="flex-1 flex flex-col gap-5 md:gap-8 w-full min-w-0">
            <AnimatePresence mode="popLayout">
              {processedMoments.filter((_, i) => i % 2 === 0).map((m) => renderMomentCard(m))}
            </AnimatePresence>
          </div>
          <div className="flex-1 flex flex-col gap-5 md:gap-8 w-full min-w-0">
            <AnimatePresence mode="popLayout">
              {processedMoments.filter((_, i) => i % 2 === 1).map((m) => renderMomentCard(m))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-12 md:py-24 min-h-[300px] md:min-h-[450px]">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center px-6 md:px-10 py-12 md:py-20 bg-white/40 dark:bg-slate-800/30 backdrop-blur-3xl rounded-[32px] md:rounded-[50px] border border-white/30 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] max-w-lg w-full mx-auto">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
              <Ghost size={32} className="md:w-12 md:h-12 text-indigo-500 relative z-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 tracking-tight">{searchQuery ? "没找到相关记忆" : "朋友圈空空如也"}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg leading-relaxed px-2 md:px-4">{searchQuery ? "尝试精简你的搜索词，或者换个心情再次出发。" : "还没有记录下任何生活碎片呢。"}</p>
          </motion.div>
        </div>
      )}

      {/* 灯箱 */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={() => setLightbox(null)}>
            {lightbox.images.length > 1 && (
              <>
                <button className="absolute left-4 md:left-12 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 border border-white/5 backdrop-blur-md" onClick={prevImg}><ChevronLeft size={24} /></button>
                <button className="absolute right-4 md:right-12 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 border border-white/5 backdrop-blur-md" onClick={nextImg}><ChevronLeft size={24} className="rotate-180" /></button>
              </>
            )}
            <motion.div key={lightbox.index} initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: -50 }}
              className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12 pointer-events-none">
              <img src={lightbox.images[lightbox.index]} className="max-w-full max-h-[75vh] md:max-h-[85vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto" alt="" />
              <div className="absolute bottom-8 md:bottom-10 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-bold tracking-widest border border-white/10">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommentCard({ comment, expandedReplies, onReply, onToggleReplies, likedCommentIds, onCommentLike }: {
  comment: ChatterCommentItem; expandedReplies: Set<number>;
  onReply: (c: ChatterCommentItem) => void; onToggleReplies: (id: number) => void;
  likedCommentIds: Set<number>; onCommentLike: (id: number) => void;
}) {
  const isExpanded = expandedReplies.has(comment.id);
  const flat = flattenReplies(comment.replies ?? []);
  const replyCount = flat.length;

  return (
    <div className="rounded-xl bg-white/40 dark:bg-slate-700/30 overflow-hidden">
      <div className="p-2 md:p-3">
        <div className="flex items-center gap-2 mb-1.5">
          {comment.github_user ? (
            <img src={comment.github_user.avatar} alt={comment.github_user.login} className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
          ) : (
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white text-[10px] font-bold">?</div>
          )}
          <span className="text-[10px] md:text-xs font-semibold text-slate-700 dark:text-slate-300">{comment.github_user?.login ?? "匿名用户"}</span>
          {comment.github_user?.type === "qq" && <span className="text-[9px] px-1 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">QQ</span>}
          <span className="text-[10px] text-slate-400 ml-auto">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap mb-1.5 md:mb-2 ml-7 md:ml-8">{comment.content}</p>
        <div className="flex items-center gap-2 ml-7 md:ml-8">
          <button type="button" onClick={() => onCommentLike(comment.id)} className={`flex items-center gap-0.5 text-[10px] transition-colors ${likedCommentIds.has(comment.id) ? "text-pink-500" : "text-slate-400 hover:text-pink-500"}`}>
            <Heart className={`w-3 h-3 ${likedCommentIds.has(comment.id) ? "fill-pink-500" : ""}`} />
            <span>{comment.likes}</span>
          </button>
          <button type="button" onClick={() => onReply(comment)} className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-sky-500 transition-colors">
            <Reply className="w-3 h-3" />回复
          </button>
          {replyCount > 0 && (
            <button type="button" onClick={() => onToggleReplies(comment.id)} className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-blue-500 transition-colors ml-auto">
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {replyCount} 条回复
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && replyCount > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="border-t border-slate-200/30 dark:border-white/5 bg-slate-50/30 dark:bg-slate-900/20">
              {flat.map((reply) => <ReplyCard key={reply.id} reply={reply} onReply={onReply} likedCommentIds={likedCommentIds} onCommentLike={onCommentLike} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReplyCard({ reply, onReply, likedCommentIds, onCommentLike }: {
  reply: ChatterCommentItem & { replyToUser?: string }; onReply: (c: ChatterCommentItem) => void;
  likedCommentIds: Set<number>; onCommentLike: (id: number) => void;
}) {
  return (
    <div className="px-2 py-1.5 md:px-3 md:py-2 border-b border-slate-200/20 dark:border-white/5 last:border-0">
      <div className="flex items-start gap-1.5 md:gap-2">
        {reply.github_user ? (
          <img src={reply.github_user.avatar} alt={reply.github_user.login} className="w-4 h-4 md:w-5 md:h-5 rounded-full mt-0.5" />
        ) : (
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white text-[8px] font-bold mt-0.5">?</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{reply.github_user?.login ?? "匿名用户"}</span>
            {reply.github_user?.type === "qq" && <span className="text-[8px] px-1 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">QQ</span>}
            <span className="text-[9px] text-slate-400">{timeAgo(reply.created_at)}</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed whitespace-pre-wrap">
            {reply.replyToUser && <span className="text-sky-500 dark:text-sky-400 mr-1">回复 @{reply.replyToUser}：</span>}
            {reply.content}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <button type="button" onClick={() => onCommentLike(reply.id)} className={`flex items-center gap-0.5 text-[9px] transition-colors ${likedCommentIds.has(reply.id) ? "text-pink-500" : "text-slate-400 hover:text-pink-500"}`}>
              <Heart className={`w-2.5 h-2.5 ${likedCommentIds.has(reply.id) ? "fill-pink-500" : ""}`} />
              <span>{reply.likes}</span>
            </button>
            <button type="button" onClick={() => onReply(reply)} className="flex items-center gap-0.5 text-[9px] text-slate-400 hover:text-sky-500 transition-colors">
              <Reply className="w-2.5 h-2.5" />回复
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
