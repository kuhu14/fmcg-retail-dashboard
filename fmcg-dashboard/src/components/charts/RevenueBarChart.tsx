"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { entityColorScale } from "@/lib/palette";
import { formatINR, formatPct } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

interface Row {
  name: string;
  revenue: number;
  /** Omitted when there's no cost basis to compute a margin from (e.g. the
   * International dashboard, which only has unit price × quantity). */
  marginPct?: number;
  orders: number;
}

export function RevenueBarChart({
  dimension,
  data,
  onBarClick,
  activeName,
  formatValue = (v) => formatINR(v, { compact: true }),
}: {
  dimension: string;
  data: Row[];
  onBarClick?: (name: string) => void;
  activeName?: string | null;
  formatValue?: (v: number) => string;
}) {
  const colorScale = entityColorScale(
    dimension,
    [...data].map((d) => d.name).sort()
  );
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="var(--chart-gridline)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatValue}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "var(--chart-gridline)", opacity: 0.4 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as Row;
            return (
              <ChartTooltip
                title={d.name}
                rows={[
                  ["Revenue", formatValue(d.revenue)],
                  ...(d.marginPct !== undefined ? [["Margin", formatPct(d.marginPct, 2)] as [string, string]] : []),
                  ["Orders", d.orders.toLocaleString("en-IN")],
                ]}
              />
            );
          }}
        />
        <Bar
          dataKey="revenue"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          cursor={onBarClick ? "pointer" : undefined}
          onClick={(d) => onBarClick?.((d as unknown as Row).name)}
        >
          {sorted.map((d) => (
            <Cell
              key={d.name}
              fill={colorScale.get(d.name)}
              opacity={activeName && activeName !== d.name ? 0.35 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
