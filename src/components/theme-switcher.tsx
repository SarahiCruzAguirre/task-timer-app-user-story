// app/components/theme-switcher.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Wait until mounted on client to prevent SSR mismatches
  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) {
        setMounted(true);
      }
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 animate-pulse shrink-0" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-xl flex items-center justify-center bg-bg-input border border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden group shrink-0"
      aria-label="Toggle Theme"
      type="button"
    >
      {/* Absolute positioning container for rotating/scaling transitions */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon (visible in light mode, hidden in dark mode) */}
        <SunIcon
          className={`w-5 h-5 absolute transition-all duration-500 transform ${
            isDark
              ? "rotate-90 scale-0 opacity-0 text-amber-500"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        {/* Moon Icon (visible in dark mode, hidden in light mode) */}
        <MoonIcon
          className={`w-5 h-5 absolute transition-all duration-500 transform ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-purple-400"
              : "-rotate-90 scale-0 opacity-0 text-purple-400"
          }`}
        />
      </div>
    </button>
  );
}