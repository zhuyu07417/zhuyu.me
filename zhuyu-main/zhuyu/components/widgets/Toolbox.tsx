"use client";

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CalculatorApp = lazy(() => import("./toolbox/CalculatorApp"));
const BookmarkApp = lazy(() => import("./toolbox/BookmarkApp"));
const WeatherApp = lazy(() => import("./toolbox/WeatherApp"));
const HoroscopeApp = lazy(() => import("./toolbox/HoroscopeApp"));

interface AppDef {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.LazyExoticComponent<React.ComponentType>;
}

const allApps: AppDef[] = [
  // ── 热门资讯 ──
  {
    id: "weather",
    name: "天气",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="#0ea5e9" strokeWidth="1.5" />
        <path d="M12 1v2M12 13v2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M1 8h2M19 8h2M4.22 11.78l1.42-1.42M16.36 5.64l1.42-1.42" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 19a4 4 0 014-4h0a3 3 0 013-3 3 3 0 013 3h0a4 4 0 010 8H6z" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    component: WeatherApp,
  },

  // ── 趣味测试 ──
  {
    id: "horoscope",
    name: "星座运势",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#8b5cf6" strokeWidth="1.5" />
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2" fill="#8b5cf6" opacity="0.3" />
      </svg>
    ),
    component: HoroscopeApp,
  },

  // ── 图片壁纸 ──

  // ── 娱乐互动 ──

  // ── 实用工具 ──
  {
    id: "bookmark",
    name: "收藏夹",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    component: BookmarkApp,
  },
  {
    id: "calculator",
    name: "计算器",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke="#f59e0b" strokeWidth="1.5" />
        <rect x="7" y="5" width="10" height="4" rx="1" fill="#fbbf24" opacity="0.3" />
        <circle cx="8" cy="13" r="1" fill="#f59e0b" />
        <circle cx="12" cy="13" r="1" fill="#f59e0b" />
        <circle cx="16" cy="13" r="1" fill="#f59e0b" />
        <circle cx="8" cy="17" r="1" fill="#f59e0b" />
        <circle cx="12" cy="17" r="1" fill="#f59e0b" />
        <circle cx="16" cy="17" r="1" fill="#f59e0b" />
      </svg>
    ),
    component: CalculatorApp,
  },
];

const STORAGE_KEY = "toolbox-order";
const APP_KEY = "toolbox-active-app";

function loadOrder(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const ids = JSON.parse(saved);
      if (Array.isArray(ids)) {
        const allIds = allApps.map((a) => a.id);
        const valid = ids.filter((id: string) => allIds.includes(id));
        const missing = allIds.filter((id) => !valid.includes(id));
        return [...valid, ...missing];
      }
    }
  } catch { }
  return allApps.map((a) => a.id);
}

function SortableAppIcon({
  app,
  onClick,
}: {
  app: AppDef;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className=""
    >
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 w-full"
      >
        {app.icon}
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{app.name}</span>
      </button>
    </div>
  );
}

type ResizeDir = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

function ResizeHandle({
  dir,
  onResize,
}: {
  dir: ResizeDir;
  onResize: (dw: number, dh: number) => void;
}) {
  const prevPos = useRef({ x: 0, y: 0 });

  const cursorMap: Record<ResizeDir, string> = {
    top: "cursor-ns-resize",
    bottom: "cursor-ns-resize",
    left: "cursor-ew-resize",
    right: "cursor-ew-resize",
    "top-left": "cursor-nwse-resize",
    "bottom-right": "cursor-nwse-resize",
    "top-right": "cursor-nesw-resize",
    "bottom-left": "cursor-nesw-resize",
  };

  const posMap: Record<ResizeDir, string> = {
    top: "top-0 left-2 right-2 h-2",
    bottom: "bottom-2 left-2 right-2 h-2",
    left: "top-2 bottom-2 left-0 w-2",
    right: "top-2 bottom-2 right-0 w-2",
    "top-left": "top-0 left-0 w-5 h-5",
    "top-right": "top-0 right-0 w-5 h-5",
    "bottom-left": "bottom-2 left-0 w-5 h-5",
    "bottom-right": "bottom-2 right-0 w-5 h-5",
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={false}
      dragSnapToOrigin
      onDragStart={(_e, info) => {
        prevPos.current = { x: info.point.x, y: info.point.y };
      }}
      onDrag={(_e, info) => {
        const dx = info.point.x - prevPos.current.x;
        const dy = info.point.y - prevPos.current.y;
        prevPos.current = { x: info.point.x, y: info.point.y };
        let dw = 0, dh = 0;
        if (dir.includes("right")) dw = dx;
        if (dir.includes("left")) dw = -dx;
        if (dir.includes("bottom")) dh = dy;
        if (dir.includes("top")) dh = -dy;
        onResize(dw, dh);
      }}
      className={`absolute z-40 ${posMap[dir]} ${cursorMap[dir]}`}
    />
  );
}

export default function Toolbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [appOrder, setAppOrder] = useState<string[]>([]);
  const btnRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const didDrag = useRef(false);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [btnRect, setBtnRect] = useState<{ left: number; top: number } | null>(null);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const [resizeOffset, setResizeOffset] = useState({ x: 0, y: 0 });
  const [panelW, setPanelW] = useState(288);
  const [panelH, setPanelH] = useState(560);
  const panelDidDrag = useRef(false);
  const panelDragControls = useDragControls();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (!initialized.current) {
      setAppOrder(loadOrder());
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (activeApp === "games") {
      localStorage.removeItem(APP_KEY);
    } else if (activeApp) {
      localStorage.setItem(APP_KEY, activeApp);
    }
  }, [activeApp]);

  // Update btnRect on open, drag, resize
  const updateBtnRect = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setBtnRect({ left: r.left, top: r.top });
    setFlipX(r.left + panelW > window.innerWidth);
    setFlipY(r.top - 64 - panelH < 0);
  }, [panelW, panelH]);

  useEffect(() => {
    if (isOpen) updateBtnRect();
  }, [isOpen, updateBtnRect]);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => updateBtnRect();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, updateBtnRect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setActiveApp(null);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleClose = () => { setIsOpen(false); setActiveApp(null); };
    window.addEventListener("close-toolbox", handleClose);
    return () => window.removeEventListener("close-toolbox", handleClose);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAppOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
        return newOrder;
      });
    }
  }, []);

  const orderedApps = appOrder.length
    ? appOrder.map((id) => allApps.find((a) => a.id === id)).filter(Boolean) as AppDef[]
    : allApps;

  const currentApp = allApps.find((a) => a.id === activeApp);

  const panelStyle: React.CSSProperties = btnRect
    ? isMobile
      ? { position: "fixed", left: "8%", right: "8%", top: "10%", bottom: "10%" }
      : flipX
        ? { position: "fixed", right: window.innerWidth - btnRect.left - 48 - resizeOffset.x, ...(flipY ? { top: btnRect.top + 48 + 8 + resizeOffset.y } : { bottom: window.innerHeight - btnRect.top + 16 - resizeOffset.y }) }
        : { position: "fixed", left: btnRect.left + resizeOffset.x, ...(flipY ? { top: btnRect.top + 48 + 8 + resizeOffset.y } : { bottom: window.innerHeight - btnRect.top + 16 - resizeOffset.y }) }
    : {};

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {isOpen && btnRect && (
          <motion.div
            drag={!isMobile}
            dragControls={panelDragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={false}
            onDragStart={() => { panelDidDrag.current = true; }}
            onDragEnd={(_e, info) => {
              setTimeout(() => { panelDidDrag.current = false; }, 100);
              setPanelOffset((prev) => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }));
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ ...panelStyle, zIndex: 30, x: isMobile ? 0 : panelOffset.x, y: isMobile ? 0 : panelOffset.y, ...(isMobile ? {} : { width: panelW, height: panelH }) }}
            className="rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col"
            ref={panelRef}
          >
            {/* 顶部拖拽把手 */}
            <div
              onPointerDown={isMobile ? undefined : (e) => panelDragControls.start(e)}
              className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing"
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {new Date().getHours().toString().padStart(2, "0")}:{new Date().getMinutes().toString().padStart(2, "0")}
              </span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              </div>
            </div>

            {activeApp && currentApp ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setActiveApp(null); localStorage.removeItem(APP_KEY); }}
                    title="返回"
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{currentApp.name}</span>
                </div>
                <div className="p-4 flex-1 overflow-auto">
                  <Suspense fallback={<div className="flex items-center justify-center h-full text-sm text-slate-400 animate-pulse">加载中...</div>}>
                    <currentApp.component />
                  </Suspense>
                </div>
              </div>
            ) : (
              <div className="px-6 pt-5 pb-10 flex-1 overflow-y-auto overflow-x-hidden">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={orderedApps.map((a) => a.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 gap-5 md:gap-4">
                      {orderedApps.map((app) => (
                        <SortableAppIcon
                          key={app.id}
                          app={app}
                          onClick={() => setActiveApp(app.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* 底部指示条 */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-24 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* 缩放把手 */}
            {!isMobile && (
              <>
                <ResizeHandle
                  dir="bottom-right"
                  onResize={(dw, dh) => {
                    setPanelW((w) => Math.min(Math.max(w + dw, 200), window.innerWidth - 32));
                    setPanelH((h) => Math.min(Math.max(h + dh, 300), window.innerHeight - 32));
                  }}
                />
                <ResizeHandle
                  dir="top-left"
                  onResize={(dw, dh) => {
                    const newW = Math.min(Math.max(panelW + dw, 200), window.innerWidth - 32);
                    const newH = Math.min(Math.max(panelH + dh, 300), window.innerHeight - 32);
                    const actualDw = newW - panelW;
                    const actualDh = newH - panelH;
                    setPanelW(newW);
                    setPanelH(newH);
                    setResizeOffset((p) => ({ x: p.x - actualDw, y: p.y - actualDh }));
                  }}
                />
                <ResizeHandle
                  dir="top-right"
                  onResize={(_dw, dh) => {
                    const newH = Math.min(Math.max(panelH + dh, 300), window.innerHeight - 32);
                    const actualDh = newH - panelH;
                    setPanelH(newH);
                    setResizeOffset((p) => ({ x: p.x, y: p.y - actualDh }));
                  }}
                />
                <ResizeHandle
                  dir="bottom-left"
                  onResize={(dw, _dh) => {
                    const newW = Math.min(Math.max(panelW + dw, 200), window.innerWidth - 32);
                    const actualDw = newW - panelW;
                    setPanelW(newW);
                    setResizeOffset((p) => ({ x: p.x - actualDw, y: p.y }));
                  }}
                />
              </>
            )}

            {/* 缩放角标 */}
            <div className="absolute bottom-1.5 right-1.5 pointer-events-none opacity-30">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12 2L2 12M12 7L7 12M12 12L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 悬浮按钮 */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={false}
        onDragStart={() => { didDrag.current = true; }}
        onDrag={() => { if (isOpen) updateBtnRect(); }}
        onDragEnd={() => {
          setTimeout(() => { didDrag.current = false; }, 100);
          if (isOpen) updateBtnRect();
        }}
        className="fixed bottom-6 left-6 z-30"
        ref={btnRef}
      >
        <button
          type="button"
          onClick={() => {
            if (didDrag.current) return;
            if (isOpen) {
              setIsOpen(false);
              setActiveApp(null);
            } else {
              setPanelOffset({ x: 0, y: 0 });
              setResizeOffset({ x: 0, y: 0 });
              setPanelW(288);
              setPanelH(560);
              const saved = localStorage.getItem(APP_KEY);
              if (saved && saved !== "games") setActiveApp(saved);
              setIsOpen(true);
            }
          }}
          title="工具箱"
          className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl flex items-center justify-center hover:shadow-2xl transition-all text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 active:scale-95"
          style={{ touchAction: "none" }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </motion.div>
    </>
  );
}
