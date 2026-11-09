"use client";

import type { DepartmentId } from "@/lib/departments";
import type { Trend } from "@/lib/trend";
import { TREND_STYLE } from "./KpiCards";

export interface TopLineItem {
  id: DepartmentId;
  label: string;
  value: string;
  sub?: string;
  trend?: Trend | null;
  comingSoon?: boolean;
}

export function DepartmentTopLine({
  items,
  onSelect,
}: {
  items: TopLineItem[];
  onSelect: (id: DepartmentId) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => {
        const style = item.trend ? TREND_STYLE[item.trend] : null;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            disabled={item.comingSoon}
            className={`flex flex-col gap-1 rounded-xl border border-[var(--card-border)] bg-[var(--chart-surface)] p-4 text-left transition-colors ${
              item.comingSoon ? "opacity-50 cursor-default" : "hover:border-[var(--chart-axis)] cursor-pointer"
            }`}
          >
            <span className="text-xs font-medium text-[var(--chart-muted)] uppercase tracking-wide">
              {item.label}
            </span>
            {item.comingSoon ? (
              <span className="text-sm text-[var(--chart-muted)]">Coming soon</span>
            ) : (
              <span
                className={`text-xl font-semibold tabular-nums flex items-center gap-1.5 ${
                  style ? style.text : "text-[var(--foreground)]"
                }`}
              >
                {item.value}
                {style && <span className="text-sm" aria-hidden="true">{style.glyph}</span>}
              </span>
            )}
            {item.sub && <span className="text-[11px] text-[var(--chart-muted)]">{item.sub}</span>}
            {!item.comingSoon && (
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">View department →</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
