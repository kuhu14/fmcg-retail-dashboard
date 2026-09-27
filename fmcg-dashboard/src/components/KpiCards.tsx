import type { Summary } from "@/lib/types";
import { formatINR, formatNumber, formatPct } from "@/lib/format";
import { Card } from "./Card";

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[var(--chart-muted)] uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums text-[var(--foreground)]">{value}</span>
      {sub && <span className="text-xs text-[var(--chart-muted)]">{sub}</span>}
    </Card>
  );
}

export function KpiCards({ summary }: { summary: Summary }) {
  const { totals, inventory } = summary;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Kpi
        label="Total Revenue"
        value={formatINR(totals.revenue, { compact: true })}
        sub={`${formatNumber(totals.orders)} orders`}
      />
      <Kpi
        label="Gross Margin"
        value={formatPct(totals.marginPct, 2)}
        sub={formatINR(totals.margin, { compact: true })}
      />
      <Kpi
        label="Avg Order Value"
        value={formatINR(totals.avgOrderValue)}
        sub={`${formatNumber(totals.units)} units sold`}
      />
      <Kpi
        label="Loyalty Members"
        value={formatPct(totals.loyaltyPct)}
        sub={`${formatNumber(totals.loyaltyCount)} of ${formatNumber(totals.orders)}`}
      />
      <Kpi
        label="Stockout Risk"
        value={formatNumber(inventory.stockoutRisk)}
        sub={`${formatPct(inventory.stockoutRiskPct)} of line items`}
      />
      <Kpi
        label="Overstocked"
        value={formatPct(inventory.overstockPct)}
        sub={`avg lead time ${inventory.avgLeadTimeDays}d`}
      />
    </div>
  );
}
