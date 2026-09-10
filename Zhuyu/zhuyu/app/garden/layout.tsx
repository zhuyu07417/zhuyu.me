"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, redirect } from "next/navigation";
import {
  ArrowLeft, LayoutDashboard, Orbit, User,
  Sparkles, Droplets, Flower2, Mountain, Code2, Grid3x3, BarChart3, FileText, Palette, QrCode, Box,
} from "lucide-react";

const navItems = [
  { href: "/garden", label: "仪表盘", icon: LayoutDashboard },
  { href: "/garden/visitor", label: "访客信息", icon: User },
    { href: "/garden/solar", label: "太阳系", icon: Orbit },
  { href: "/garden/fireworks", label: "烟花", icon: Sparkles },
  { href: "/garden/fluid", label: "流体", icon: Droplets },
  { href: "/garden/kaleidoscope", label: "万花筒", icon: Flower2 },
  { href: "/garden/sand", label: "重力沙子", icon: Mountain },
    { href: "/garden/life", label: "生命游戏", icon: Grid3x3 },
    { href: "/garden/sorting", label: "排序算法", icon: BarChart3 },
      { href: "/garden/color", label: "颜色工具", icon: Palette },
  { href: "/garden/studio", label: "3D工作室", icon: Box },
  { href: "/garden/qrcode", label: "二维码", icon: QrCode },
  ];

export default function GardenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("garden-unlock") === "true";
  });

  if (!unlocked) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col -mt-16">
      {/* 桌面端：侧边栏 + 内容（横向排列） */}
      <div className="hidden md:flex flex-1">
        <aside className="flex flex-col w-56 shrink-0 border-r border-slate-200/60 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 h-screen">
          <div className="p-5 border-b border-slate-200/60 dark:border-white/5">
            <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> 返回主站
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-sky-500">
                  <circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="12" y2="22" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 dark:text-white">星港</h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Star Harbor</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((nav) => {
              const active = pathname === nav.href;
              return (
                <Link key={nav.href} href={nav.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}>
                  <nav.icon className="w-4 h-4" /> {nav.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-100/40 dark:bg-slate-950/40">
          {children}
        </main>
      </div>

      {/* 移动端：顶栏 + 横向导航 + 内容（纵向排列，占满宽度） */}
      <div className="flex flex-col md:hidden min-w-0">
        <div className="flex items-center justify-between px-4 h-11 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-xl shrink-0">
          <Link href="/" className="text-xs text-slate-400 hover:text-sky-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> 返回
          </Link>
          <span className="text-sm font-bold text-slate-800 dark:text-white">星港</span>
          <div className="w-10" />
        </div>
        <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 shrink-0" style={{WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
          {navItems.map((nav) => {
            const active = pathname === nav.href;
            return (
              <Link key={nav.href} href={nav.href}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 transition-all ${
                  active ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}>
                <nav.icon className="w-3.5 h-3.5" /> {nav.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-100/40 dark:bg-slate-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
