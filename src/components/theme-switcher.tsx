// app/components/theme-switcher.tsx
"use client";

import {Switch} from "@heroui/react";
import {useTheme} from "next-themes";
import {useEffect, useState} from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const {resolvedTheme, setTheme} = useTheme();

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
    return <div className="w-12 h-6 rounded-full bg-white/5 animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Switch
        isSelected={isDark}
        onChange={(isSelected) => {
          setTheme(isSelected ? "dark" : "light");
        }}
        aria-label="Toggle theme"
      >
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </div>
  );
}