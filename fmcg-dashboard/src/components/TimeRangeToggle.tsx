"use client";

import { TIME_RANGES, type TimeRangeId } from "@/lib/timeRange";

export function TimeRangeToggle({
  value,
  onChange,
}: {
  value: TimeRangeId;
  onChange: (id: TimeRangeId) => void;
}) {
  return (
    <div className="flex flex-nowrap flex-shrink-0 items-center rounded-lg border border-[var(--card-border)] bg-[var(--chart-surface)] p-0.5">
      {TIME_RANGES.map((range) => {
        const active = range.id === value;
        return (
          <button
            key={range.id}
            type="button"
            onClick={() => onChange(range.id)}
            aria-pressed={active}
            className={`px-2.5 h-7 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              active
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40"
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
