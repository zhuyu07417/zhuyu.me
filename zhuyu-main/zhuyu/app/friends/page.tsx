"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Users, ExternalLink, X } from "lucide-react";
import { getFriendLinks, type FriendLinkItem } from "@/app/api";
import MessageBottle from "@/components/icons/MessageBottle";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomScatter(count: number) {
  const cols = Math.ceil(Math.sqrt(count * 1.6));
  const rows = Math.ceil(count / cols);
  const base: { x: number; y: number; rot: number; scale: number }[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = (col + 0.5) / cols * 100;
    const by = (row + 0.5) / rows * 100;
    base.push({
      x: Math.max(4, Math.min(96, bx + (Math.random() - 0.5) * (90 / cols))),
      y: Math.max(2, Math.min(98, by + (Math.random() - 0.5) * (60 / rows))),
      rot: (Math.random() - 0.5) * 120,
      scale: 0.8 + Math.random() * 0.4,
    });
  }
  return shuffle(base);
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<FriendLinkItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: "", url: "", avatar: "", description: "" });
  const [applyLoading, setApplyLoading] = useState(false);
  const [user, setUser] = useState<{ login: string; type: string } | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    getFriendLinks().then(setFriends).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const gh = localStorage.getItem("github_user");
      const qq = localStorage.getItem("qq_user");
      const u = gh ? JSON.parse(gh) : qq ? JSON.parse(qq) : null;
      if (u) setUser(u);
    } catch {}
  }, []);

  async function submitApply() {
    if (!user) { alert("请先通过 GitHub 或 QQ 登录"); return; }
    if (!applyForm.name || !applyForm.url) { alert("请填写网站名称和链接"); return; }
    setApplyLoading(true);
    try {
      const token = localStorage.getItem("qq_token") || localStorage.getItem("github_token") || "";
      const res = await fetch("/api/friend-links/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(applyForm),
      });
      const data = await res.json();
      if (res.ok) { alert(data.message || "申请已提交"); setShowApply(false); setApplyForm({ name: "", url: "", avatar: "", description: "" }); }
      else { alert(data.detail || "申请失败"); }
    } catch { alert("网络错误"); }
    finally { setApplyLoading(false); }
  }

  const positions = useMemo(() => (friends.length ? randomScatter(friends.length) : []), [friends.length]);
  const [offsets, setOffsets] = useState<Record<number, { dx: number; dy: number }>>({});
  const dragRef = useRef<{ id: number; startX: number; startY: number; startDx: number; startDy: number; moved: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: number) => {
    const cur = offsets[id] || { dx: 0, dy: 0 };
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, startDx: cur.dx, startDy: cur.dy, moved: false };
    e.preventDefault();
  }, [offsets]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current;
    if (!d || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = d.startDx + (e.clientX - d.startX) / rect.width * 100;
    const dy = d.startDy + (e.clientY - d.startY) / rect.height * 100;
    if (Math.abs(e.clientX - d.startX) > 3 || Math.abs(e.clientY - d.startY) > 3) d.moved = true;
    setOffsets(prev => ({ ...prev, [d.id]: { dx, dy } }));
  }, []);

  const wasDragged = useRef(false);
  const handleMouseUp = useCallback(() => {
    wasDragged.current = dragRef.current?.moved ?? false;
    dragRef.current = null;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <div className="mb-5 md:mb-10">
        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
          <Users className="w-5 h-5 md:w-7 md:h-7 text-sky-500" />
          <h1 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">友链</h1>
          <button onClick={() => setShowApply(true)} className="w-8 h-8 rounded-lg bg-white/50 dark:bg-slate-700/50 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:scale-110 transition-all border border-white/40 dark:border-white/10 shadow-sm cursor-pointer text-sm font-bold">+</button>
        </div>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 ml-7 md:ml-10">
          {loading ? "漂流瓶 · 每一封信笺都来自远方的朋友" : friends.length ? `漂流瓶 · 来自远方的 ${friends.length} 个朋友` : "漂流瓶 · 暂无友链"}
        </p>
      </div>

      <div ref={containerRef} className="relative select-none" style={{ height: isMobile ? "400px" : "700px" }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {loading ? (
          <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : friends.length ? (
          friends.map((friend, i) => {
            const pos = positions[i]; const off = offsets[friend.id] || { dx: 0, dy: 0 };
            const bottleSize = isMobile ? Math.round(48 * pos.scale) : Math.round(68 * pos.scale);
            const floatDur = 3.2 + (i % 5) * 0.6;
            return (
              <div key={friend.id} className="absolute cursor-grab active:cursor-grabbing group -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x + off.dx}%`, top: `${pos.y + off.dy}%`, transform: `rotate(${pos.rot}deg)`, animation: `bottle-float ${floatDur}s ease-in-out ${i * 0.47}s infinite, bottle-fade-in 0.5s ease-out ${i * 0.06}s both`, zIndex: 10 + i } as React.CSSProperties}
                onMouseDown={(e) => handleMouseDown(e, friend.id)}
                onClick={() => { if (!wasDragged.current) setActive(friend); }}>
                <div className="relative transition-transform duration-300 group-hover:scale-110">
                  <MessageBottle size={bottleSize} />
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-slate-200 shadow-lg border border-white/40">{friend.name}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400"><Users className="w-12 h-12 mb-4 opacity-40" /><p className="text-base">暂无友链</p></div>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">点击漂流瓶查看朋友详情 · 欢迎交换友链</p>

      {/* 详情弹窗 */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white/70 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/50 shadow-2xl p-5 text-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActive(null)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/50 flex items-center justify-center text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-purple-400 p-[3px] shadow-xl">
                {active.avatar ? <img src={active.avatar} alt={active.name} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">{active.name[0]}</div>}
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">{active.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{active.description || "暂无描述"}</p>
            <a href={active.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-sky-500 text-white text-xs font-medium hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20"><ExternalLink className="w-3.5 h-3.5" /> 访问</a>
          </div>
        </div>
      )}

      {/* 申请弹窗 */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowApply(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowApply(false)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/50 flex items-center justify-center text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">申请友链</h3>
            {!user ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 mb-1">请先登录</p>
                <a href="#" onClick={(e) => { e.preventDefault(); sessionStorage.setItem("github_redirect", window.location.pathname); window.location.href = "/api/auth/github/login?redirect=" + encodeURIComponent(window.location.pathname); }} className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/50 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-600 transition-all w-full text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center"><svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white dark:text-slate-900"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></div>
                  GitHub 登录
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); sessionStorage.setItem("github_redirect", window.location.pathname); window.location.href = "/api/auth/qq/login?redirect=" + encodeURIComponent(window.location.pathname); }} className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-900 transition-all w-full text-white text-xs font-medium hover:bg-slate-800">
                  <div className="w-7 h-7 rounded-full bg-[#12B7F5] flex items-center justify-center"><svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.395 1.025.19 0 .46-.31.762-.865.15.4.443.998.863 1.518-.37.165-.636.4-.636.725 0 .5.643.725 1.525.725.565 0 1.077-.11 1.477-.3.398.23.876.39 1.408.455A5.6 5.6 0 0012.003 22c1.61 0 3.077-.515 4.016-1.335.38.065.75.13 1.083.13.88 0 1.257-.34 1.257-.71 0-.3-.22-.515-.57-.69.39-.5.65-1.09.78-1.49.31.56.58.875.78.875.235 0 .415-.38.415-1.05 0-2.52-2.162-6.947-2.162-6.947.86-3.48 1.328-5.175-.237-5.175z"/></svg></div>
                  QQ 登录
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">已登录：{user.login} ({user.type})</p>
                <input value={applyForm.name} onChange={e => setApplyForm(p => ({...p, name: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" placeholder="网站名称 *" />
                <input value={applyForm.url} onChange={e => setApplyForm(p => ({...p, url: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" placeholder="网站链接 *" />
                <input value={applyForm.avatar} onChange={e => setApplyForm(p => ({...p, avatar: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" placeholder="头像 URL（可选）" />
                <input value={applyForm.description} onChange={e => setApplyForm(p => ({...p, description: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" placeholder="描述（可选）" />
                <button onClick={submitApply} disabled={applyLoading} className="w-full py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50">{applyLoading ? "提交中..." : "提交申请"}</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bottle-float { 0%, 100% { transform: translateY(0) rotate(var(--rot)); } 25% { transform: translateY(-8px) rotate(calc(var(--rot) + 1deg)); } 75% { transform: translateY(5px) rotate(calc(var(--rot) - 1deg)); } }
        @keyframes bottle-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
