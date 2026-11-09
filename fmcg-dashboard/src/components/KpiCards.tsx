import type { Trend } from "@/lib/trend";
import { Card } from "./Card";

const TREND_STYLE: Record<Trend, { text: string; glyph: string }> = {
  up: { text: "text-emerald-600 dark:text-emerald-400", glyph: "▲" },
  down: { text: "text-red-600 dark:text-red-400", glyph: "▼" },
  flat: { text: "text-blue-600 dark:text-blue-400", glyph: "▬" },
};

export function Kpi({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  /** Direction vs. the previous month, or null/undefined when there isn't
   * enough data (e.g. a filter narrows the view to a single month) to tell. */
  trend?: Trend | null;
}) {
  const style = trend ? TREND_STYLE[trend] : null;
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[var(--chart-muted)] uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-2xl font-semibold tabular-nums flex items-center gap-1.5 ${
          style ? style.text : "text-[var(--foreground)]"
        }`}
      >
        {value}
        {style && <span className="text-sm" aria-hidden="true">{style.glyph}</span>}
      </span>
      {sub && <span className="text-xs text-[var(--chart-muted)]">{sub}</span>}
    </Card>
  );
}
