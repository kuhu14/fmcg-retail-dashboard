"use client";

import { useRef } from "react";

const DOUBLE_CLICK_MS = 400;

/**
 * Click a bar/slice/point to filter everything else by it; click the same
 * one again within DOUBLE_CLICK_MS to clear it -- a lightweight double-click
 * that doesn't depend on recharts forwarding a real dblclick event (its
 * onClick already fires reliably on every chart type here; onDoubleClick
 * isn't consistently wired through Bar/Pie/Line in this recharts version).
 */
export function useChartClickFilter<F extends object>(
  setFilter: (updater: (prev: F) => F) => void,
  onApplied?: () => void
) {
  const lastRef = useRef<{ key: string; value: unknown; time: number } | null>(null);

  return function applyChartFilter(patch: Partial<F>) {
    const key = Object.keys(patch)[0] as keyof F;
    const value = patch[key];
    const now = Date.now();
    const last = lastRef.current;
    const isRepeat = !!last && last.key === key && last.value === value && now - last.time < DOUBLE_CLICK_MS;

    if (isRepeat) {
      setFilter((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      lastRef.current = null;
    } else {
      setFilter((prev) => ({ ...prev, ...patch }));
      lastRef.current = { key: key as string, value, time: now };
    }
    onApplied?.();
  };
}
