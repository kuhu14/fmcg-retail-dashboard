"use client";

import { useCallback, useEffect, useState } from "react";
import { isDaytime } from "@/lib/sun";

export type ThemeMode = "light" | "dark" | "system" | "sun";

const MODE_KEY = "fmcg-theme-mode";
const RECHECK_INTERVAL_MS = 60 * 1000;

function applyTheme(resolved: "light" | "dark" | null) {
  const root = document.documentElement;
  if (resolved) root.setAttribute("data-theme", resolved);
  else root.removeAttribute("data-theme");
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "sun";
  try {
    return (localStorage.getItem(MODE_KEY) as ThemeMode | null) ?? "sun";
  } catch {
    return "sun";
  }
}

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {}
  }, []);

  useEffect(() => {
    if (mode === "light" || mode === "dark") {
      applyTheme(mode);
      return;
    }
    if (mode === "system") {
      applyTheme(null);
      return;
    }

    // "sun" mode: silently re-check the clock on an interval and flip the
    // theme at the 6am/6pm boundary -- no visible timer or countdown, just
    // the background check.
    const update = () => applyTheme(isDaytime(new Date()) ? "light" : "dark");
    update();
    const timer = setInterval(update, RECHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [mode]);

  return { mode, setMode };
}
