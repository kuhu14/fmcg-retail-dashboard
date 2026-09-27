"use client";

import type { Insight, RecordFilter } from "@/lib/types";
import { SEVERITY_STYLE } from "@/lib/palette";

export function InsightCards({
  insights,
  activeInsightId,
  onApply,
}: {
  insights: Insight[];
  activeInsightId: string | null;
  onApply: (insight: Insight) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {insights.map((insight) => {
        const style = SEVERITY_STYLE[insight.severity];
        const active = activeInsightId === insight.id;
        return (
          <div
            key={insight.id}
            className={`rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
              active
                ? "border-[var(--chart-axis)] bg-[var(--chart-surface)] ring-2 ring-offset-0"
                : "border-[var(--card-border)] bg-[var(--chart-surface)]"
            }`}
            style={active ? { boxShadow: `0 0 0 2px ${style.color}33` } : undefined}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${style.badgeClass}`}
              >
                {style.label}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] leading-snug">
              {insight.title}
            </h4>
            <p className="text-xs text-[var(--chart-muted)] leading-relaxed flex-1">
              {insight.description}
            </p>
            <button
              type="button"
              onClick={() => onApply(insight)}
              className="mt-1 self-start text-xs font-medium rounded-md px-2.5 py-1.5 transition-colors"
              style={{
                color: active ? "white" : style.color,
                background: active ? style.color : `${style.color}14`,
              }}
            >
              {active ? "Applied to table below ✓" : `${insight.actionLabel} →`}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function filterFromInsight(insight: Insight): RecordFilter {
  return insight.filter;
}
