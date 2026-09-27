import type { Summary } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { Card } from "./Card";

export function DataSourceInfo({ summary }: { summary: Summary }) {
  return (
    <Card title="Data source" subtitle="Everything on this page is queried live, nothing is pre-baked into the frontend">
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
        <div>
          <dt className="text-[var(--chart-muted)]">Pipeline</dt>
          <dd className="font-medium text-[var(--foreground)]">SQLite (fmcg.db) → FastAPI → Next.js (Axios)</dd>
        </div>
        <div>
          <dt className="text-[var(--chart-muted)]">Records</dt>
          <dd className="font-medium text-[var(--foreground)] tabular-nums">{formatNumber(summary.meta.recordCount)}</dd>
        </div>
        <div>
          <dt className="text-[var(--chart-muted)]">Columns</dt>
          <dd className="font-medium text-[var(--foreground)] tabular-nums">{summary.meta.columns.length}</dd>
        </div>
        <div>
          <dt className="text-[var(--chart-muted)]">Coverage</dt>
          <dd className="font-medium text-[var(--foreground)]">Calendar year 2024, 8 Indian metro cities</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-1.5">
        {summary.meta.columns.map((c) => (
          <span
            key={c}
            className="text-[10px] rounded-md bg-[var(--chart-gridline)]/50 text-[var(--chart-muted)] px-2 py-1 font-mono"
          >
            {c}
          </span>
        ))}
      </div>
    </Card>
  );
}
