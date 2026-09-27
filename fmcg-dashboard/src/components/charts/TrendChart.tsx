"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR, formatPct, monthLabel } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";
import type { Summary } from "@/lib/types";

export function TrendChart({
  data,
  onPointClick,
  activeMonth,
}: {
  data: Summary["monthlyTrend"];
  onPointClick?: (month: string) => void;
  activeMonth?: string | null;
}) {
  const rows = data.map((d) => ({ ...d, label: monthLabel(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={rows} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="var(--chart-gridline)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatINR(v, { compact: true })}
          width={56}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as (typeof rows)[number];
            return (
              <ChartTooltip
                title={d.label}
                rows={[
                  ["Revenue", formatINR(d.revenue, { compact: true })],
                  ["Margin %", formatPct(d.marginPct, 2)],
                  ["Orders", d.orders.toLocaleString("en-IN")],
                ]}
              />
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#2a78d6"
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload } = props;
            const isActive = activeMonth === payload.month;
            return (
              <circle
                key={payload.month}
                cx={cx}
                cy={cy}
                r={isActive ? 6 : 4}
                fill="#2a78d6"
                stroke="var(--chart-surface)"
                strokeWidth={2}
                cursor={onPointClick ? "pointer" : undefined}
                onClick={() => onPointClick?.(payload.month)}
              />
            );
          }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
