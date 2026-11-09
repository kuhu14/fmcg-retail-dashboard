import type { RecordFilter } from "@/lib/types";
import { FILTER_LABELS } from "@/lib/filterLabels";

export function FilterBar({ filter, onReset }: { filter: RecordFilter; onReset: () => void }) {
  // `search` is a table-only concern (see useSummary's summaryParams) so it's
  // left out here -- this bar only reflects what's actually shaping the KPIs,
  // charts and insights on the page.
  const entries = Object.entries(filter).filter(([key, v]) => key !== "search" && v !== undefined);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2">
      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Focused on:</span>
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="text-xs rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 font-medium"
        >
          {FILTER_LABELS[key]?.(value) ?? `${key}: ${String(value)}`}
        </span>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="ml-auto text-xs font-medium rounded-md border border-[var(--card-border)] px-2.5 py-1 text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40"
      >
        Reset
      </button>
    </div>
  );
}
