import type { ComponentType, SVGProps } from "react";
import type { Trend } from "@/lib/trend";
import {
  AgeMissingIcon,
  CostIcon,
  CriticalStockIcon,
  LeadTimeIcon,
  LoyaltyIcon,
  MarginIcon,
  NonLoyaltyIcon,
  OrderValueIcon,
  OrdersIcon,
  OverstockIcon,
  RevenueIcon,
  StockoutIcon,
  UnitsIcon,
} from "./icons/KpiIcons";
import { Card } from "./Card";

const TREND_STYLE: Record<Trend, { text: string; glyph: string }> = {
  up: { text: "text-emerald-600 dark:text-emerald-400", glyph: "▲" },
  down: { text: "text-red-600 dark:text-red-400", glyph: "▼" },
  flat: { text: "text-blue-600 dark:text-blue-400", glyph: "→" },
};

// Keyed by the exact label text each Kpi call-site passes, so every tile
// gets an icon unique to what it's showing without threading an `icon` prop
// through every call site individually.
const KPI_ICON_BY_LABEL: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "Total Revenue": RevenueIcon,
  "Total Cost": CostIcon,
  "Gross Margin": MarginIcon,
  "Avg Order Value": OrderValueIcon,
  "Avg Order Value (Loyalty)": LoyaltyIcon,
  "Avg Order Value (Non-loyalty)": NonLoyaltyIcon,
  Orders: OrdersIcon,
  "Units Sold": UnitsIcon,
  "Loyalty Members": LoyaltyIcon,
  "Stockout Risk": StockoutIcon,
  "Critical Stock": CriticalStockIcon,
  Overstocked: OverstockIcon,
  "Avg Lead Time": LeadTimeIcon,
  "Age Missing": AgeMissingIcon,
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
  const Icon = KPI_ICON_BY_LABEL[label];
  return (
    <Card className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--chart-muted)] uppercase tracking-wide">
        {Icon && <Icon aria-hidden="true" />}
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
