"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { entityColorScale } from "@/lib/palette";
import { formatINR, formatPct } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

interface Row {
  name: string;
  revenue: number;
  orders: number;
}

export function MixDonutChart({
  dimension,
  data,
  onSliceClick,
  activeName,
}: {
  dimension: string;
  data: Row[];
  onSliceClick?: (name: string) => void;
  activeName?: string | null;
}) {
  const colorScale = entityColorScale(
    dimension,
    [...data].map((d) => d.name).sort()
  );
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="60%" height={220}>
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Row;
              return (
                <ChartTooltip
                  title={d.name}
                  rows={[
                    ["Revenue", formatINR(d.revenue, { compact: true })],
                    ["Share", formatPct((d.revenue / total) * 100)],
                    ["Orders", d.orders.toLocaleString("en-IN")],
                  ]}
                />
              );
            }}
          />
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            cornerRadius={4}
            cursor={onSliceClick ? "pointer" : undefined}
            onClick={(d) => onSliceClick?.((d as unknown as Row).name)}
          >
            {data.map((d) => (
              <Cell
                key={d.name}
                fill={colorScale.get(d.name)}
                opacity={activeName && activeName !== d.name ? 0.35 : 1}
                stroke="var(--chart-surface)"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex flex-col gap-1.5 text-xs flex-1 min-w-0">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: colorScale.get(d.name) }}
            />
            <span className="truncate text-[var(--foreground)]">{d.name}</span>
            <span className="ml-auto tabular-nums text-[var(--chart-muted)]">
              {formatPct((d.revenue / total) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
