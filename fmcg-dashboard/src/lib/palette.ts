// Categorical palette (8 slots), validated colorblind-safe with
// scripts/validate_palette.js from the dataviz skill — do not reorder.
export const CATEGORICAL_LIGHT = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
] as const;

export const CATEGORICAL_DARK = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767",
] as const;

export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const CHART_CHROME = {
  gridline: "var(--chart-gridline)",
  axis: "var(--chart-axis)",
  mutedText: "var(--chart-muted)",
};

// Stable entity -> color assignment: each dimension gets its own fixed
// name -> slot mapping (first-seen order in the source dictionary), so a
// series' color never changes when filtering re-sorts or removes rows.
const entityColorCache = new Map<string, Map<string, string>>();

export function entityColorScale(dimension: string, names: string[]): Map<string, string> {
  const cacheKey = `${dimension}:${names.join(",")}`;
  const existing = entityColorCache.get(cacheKey);
  if (existing) return existing;
  const map = new Map<string, string>();
  names.forEach((name, i) => {
    map.set(name, CATEGORICAL_LIGHT[i % CATEGORICAL_LIGHT.length]);
  });
  entityColorCache.set(cacheKey, map);
  return map;
}

export const SEVERITY_STYLE: Record<
  "critical" | "warning" | "opportunity" | "info",
  { color: string; label: string; badgeClass: string }
> = {
  critical: {
    color: STATUS.critical,
    label: "Critical",
    badgeClass: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
  },
  warning: {
    color: STATUS.warning,
    label: "Watch",
    badgeClass: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
  },
  opportunity: {
    color: STATUS.good,
    label: "Opportunity",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  },
  info: {
    color: "#2a78d6",
    label: "Info",
    badgeClass: "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
  },
};
