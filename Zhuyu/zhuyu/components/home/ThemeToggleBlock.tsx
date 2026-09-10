"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export default function ThemeToggleBlock() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      onClick={toggleTheme}
      className={`h-full w-full rounded-3xl backdrop-blur-md border shadow-xl p-6 flex flex-col justify-center items-center transition-all duration-500 hover:scale-[1.05] cursor-pointer group relative overflow-hidden
        ${isDark ? 'bg-slate-800/40 border-slate-600/50' : 'bg-white/40 border-white/60'}
      `}
    >
      <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 shadow-inner flex-shrink-0">
        <div className={`absolute inset-0 transition-transform duration-700 ${isDark ? '-translate-y-full' : 'translate-y-0'} bg-gradient-to-tr from-sky-300 to-yellow-200`}></div>
        <div className={`absolute inset-0 transition-transform duration-700 ${isDark ? 'translate-y-0' : 'translate-y-full'} bg-gradient-to-tr from-indigo-900 to-slate-800`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'} text-2xl drop-shadow-md`}>
          🌸
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'} text-2xl drop-shadow-md`}>
          ✨
        </div>
      </div>
      <h3 className={`text-lg font-bold transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-800'}`}>
        {isDark ? '夜间模式' : '日间模式'}
      </h3>
    </div>
  );
}
