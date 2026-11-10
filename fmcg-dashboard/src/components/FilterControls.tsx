"use client";

import type { ReactNode } from "react";

export function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-shrink-0 flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--chart-muted)] whitespace-nowrap">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  sort = true,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  /** Alphabetical by default -- pass false for options with a more useful
   * natural order (e.g. calendar months, which should stay chronological). */
  sort?: boolean;
}) {
  const shown = sort ? [...options].sort((a, b) => a.label.localeCompare(b.label)) : options;
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs rounded-md border border-[var(--card-border)] bg-[var(--background)] px-1.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[68px] flex-shrink"
    >
      <option value="">{label}</option>
      {shown.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
