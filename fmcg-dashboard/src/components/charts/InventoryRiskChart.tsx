"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STATUS } from "@/lib/palette";
import { ChartTooltip } from "./ChartTooltip";

interface Row {
  name: string;
  atRiskOrders: number;
}

export function InventoryRiskChart({
  data,
  onBarClick,
  activeName,
}: {
  data: Row[];
  onBarClick?: (name: string) => void;
  activeName?: string | null;
}) {
  const sorted = [...data].sort((a, b) => b.atRiskOrders - a.atRiskOrders);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid stroke="var(--chart-gridline)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          cursor={{ fill: "var(--chart-gridline)", opacity: 0.4 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as Row;
            return (
              <ChartTooltip title={d.name} rows={[["At-risk line items", String(d.atRiskOrders)]]} />
            );
          }}
        />
        <Bar dataKey="atRiskOrders" radius={[0, 4, 4, 0]} maxBarSize={18} cursor={onBarClick ? "pointer" : undefined} onClick={(d) => onBarClick?.((d as unknown as Row).name)}>
          {sorted.map((d) => (
            <Cell
              key={d.name}
              fill={STATUS.critical}
              opacity={activeName && activeName !== d.name ? 0.35 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
