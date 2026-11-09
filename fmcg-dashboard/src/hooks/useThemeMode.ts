"use client";

import { useCallback, useEffect, useState } from "react";
import { getSunTimes } from "@/lib/sun";

export type ThemeMode = "light" | "dark" | "system" | "sun";
export type SunStatus = "ok" | "denied" | "unsupported" | null;

const MODE_KEY = "fmcg-theme-mode";
const GEO_KEY = "fmcg-theme-geo";
const GEO_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

function applyTheme(resolved: "light" | "dark" | null) {
  const root = document.documentElement;
  if (resolved) root.setAttribute("data-theme", resolved);
  else root.removeAttribute("data-theme");
}

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [sunStatus, setSunStatus] = useState<SunStatus>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY) as ThemeMode | null;
      if (saved) setModeState(saved);
    } catch {}
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {}
  }, []);

  useEffect(() => {
    if (mode === "light" || mode === "dark") {
      setSunStatus(null);
      applyTheme(mode);
      return;
    }
    if (mode === "system") {
      setSunStatus(null);
      applyTheme(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const resolveWithCoords = (lat: number, lon: number) => {
      const update = () => {
        const { sunrise, sunset } = getSunTimes(new Date(), lat, lon);
        const now = new Date();
        applyTheme(now >= sunrise && now < sunset ? "light" : "dark");
      };
      update();
      timer = setInterval(update, RECHECK_INTERVAL_MS);
      setSunStatus("ok");
    };

    const fallback = (status: "denied" | "unsupported") => {
      if (cancelled) return;
      setSunStatus(status);
      applyTheme(null);
    };

    try {
      const cachedRaw = localStorage.getItem(GEO_KEY);
      const cached = cachedRaw ? (JSON.parse(cachedRaw) as { lat: number; lon: number; at: number }) : null;
      if (cached && Date.now() - cached.at < GEO_MAX_AGE_MS) {
        resolveWithCoords(cached.lat, cached.lon);
        return () => {
          cancelled = true;
          if (timer) clearInterval(timer);
        };
      }
    } catch {}

    if (!navigator.geolocation) {
      fallback("unsupported");
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        try {
          localStorage.setItem(GEO_KEY, JSON.stringify({ lat: latitude, lon: longitude, at: Date.now() }));
        } catch {}
        resolveWithCoords(latitude, longitude);
      },
      () => fallback("denied"),
      { timeout: 8000 }
    );

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [mode]);

  return { mode, setMode, sunStatus };
}
