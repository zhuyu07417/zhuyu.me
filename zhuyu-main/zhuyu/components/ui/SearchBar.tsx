"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPosts, type PostItem } from "@/app/api/posts";

const HL = ({ t, q }: { t: string; q: string }) => {
  if (!q.trim() || !t) return <>{t}</>;
  const r = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi");
  return <>{t.split(r).map((p,i) => p.toLowerCase()===q.toLowerCase() ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-500/80 text-slate-900 dark:text-white px-1 rounded font-bold">{p}</mark> : <span key={i}>{p}</span>)}</>;
};

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<PostItem[]>([]);
  const [ld, setLd] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tmr = useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (tmr.current) clearTimeout(tmr.current);
    const s = q.trim();
    if (!s || s==="5201314") { setRes([]); return; }
    tmr.current = setTimeout(async () => {
      try { setRes(await getPosts({status:"published",keyword:s,page:1,size:8})); setOpen(true); } catch { setRes([]); }
    }, 300);
    return () => { if (tmr.current) clearTimeout(tmr.current); };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    if (s==="5201314") { localStorage.setItem("garden-unlock","true"); router.push("/garden"); setQ(""); setOpen(false); return; }
    if (s) { router.push(`/posts?keyword=${encodeURIComponent(s)}`); setOpen(false); }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-10 z-[100]" ref={ref}>
      <form className="relative group" onSubmit={submit}>
        <input type="text" className="w-full pl-14 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200 transition-all placeholder-slate-500 dark:placeholder-slate-400 font-medium text-lg relative z-0" placeholder="搜寻标题、描述或标签..." value={q} onChange={e=>{setQ(e.target.value);if(e.target.value.trim())setOpen(true);}} onFocus={()=>res.length>0&&setOpen(true)} autoComplete="off" spellCheck="false" />
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none select-none z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </form>
      {open && q.trim()!=="" && q.trim()!=="5201314" && (
          <div className="absolute top-full left-0 right-0 mt-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-white/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden max-h-[450px] overflow-y-auto z-20">
            {res.length>0 ? (
              <div className="flex flex-col py-3">
                {res.map(p=>(
                  <Link href={`/posts/${p.slug}`} key={p.id} onClick={()=>setOpen(false)} className="px-6 py-5 hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10 transition-colors border-b border-slate-100/50 dark:border-slate-800/50 last:border-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 line-clamp-1"><HL t={p.title} q={q.trim()}/></h4>
                      {p.published_at && <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md shrink-0 mt-1">{p.published_at.split("T")[0]}</span>}
                    </div>
{p.description && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed"><HL t={p.description} q={q.trim()} /></p>}
                    {p.tags?.length>0 && <div className="flex flex-wrap gap-2 mt-2">{p.tags.map(t=><span key={t} className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md"><HL t={t} q={q.trim()}/></span>)}</div>}
                  </Link>
                ))}
                {res.length>=8 && <Link href={`/posts?keyword=${encodeURIComponent(q.trim())}`} onClick={()=>setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-indigo-500 border-t border-slate-200/50 dark:border-slate-700/50 hover:bg-indigo-50/50 transition-colors">查看全部结果</Link>}
              </div>
            ) : res.length===0 ? (
              <div className="px-6 py-12 text-center"><p className="text-slate-500 dark:text-slate-400 font-medium">未发现关于 &quot;<span className="text-indigo-500 font-bold">{q.trim()}</span>&quot; 的踪迹</p></div>
            ) : null}
          </div>
        )}
    </div>
  );
}
