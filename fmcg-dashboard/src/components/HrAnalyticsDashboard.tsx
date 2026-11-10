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
import { Card } from "./Card";
import { ChartTooltip } from "./charts/ChartTooltip";
import { entityColorScale } from "@/lib/palette";
import {
  ATTRITION_BY_AGE_GROUP,
  ATTRITION_BY_EDUCATION_FIELD,
  ATTRITION_BY_GENDER,
  ATTRITION_BY_JOB_ROLE,
  ATTRITION_BY_SALARY_SLAB,
  HR_SUMMARY,
} from "@/lib/hrAnalytics";

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2">
      <span className="text-[11px] text-[var(--chart-muted)]">{label}</span>
      <p className="text-lg font-semibold text-[var(--foreground)] tabular-nums">{value}</p>
      {sub && <span className="text-[11px] text-[var(--chart-muted)]">{sub}</span>}
    </div>
  );
}

function CountBarChart({
  dimension,
  data,
  layout = "vertical",
  height = 220,
  unit = "",
  valueLabel = "Attrition",
}: {
  dimension: string;
  data: { name: string; count: number }[];
  layout?: "vertical" | "horizontal";
  height?: number;
  /** Appended to axis ticks and tooltip values, e.g. "%" for share charts. */
  unit?: string;
  valueLabel?: string;
}) {
  const colorScale = entityColorScale(dimension, data.map((d) => d.name).sort());
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const formatValue = (v: number) => `${v.toLocaleString("en-IN")}${unit}`;

  if (layout === "horizontal") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
        >
          <CartesianGrid stroke="var(--chart-gridline)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatValue}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={false}
            width={150}
          />
          <Tooltip
            cursor={{ fill: "var(--chart-gridline)", opacity: 0.4 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as { name: string; count: number };
              return <ChartTooltip title={d.name} rows={[[valueLabel, formatValue(d.count)]]} />;
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {sorted.map((d) => (
              <Cell key={d.name} fill={colorScale.get(d.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="var(--chart-gridline)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
          tickFormatter={formatValue}
        />
        <Tooltip
          cursor={{ fill: "var(--chart-gridline)", opacity: 0.4 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as { name: string; count: number };
            return <ChartTooltip title={d.name} rows={[[valueLabel, formatValue(d.count)]]} />;
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {sorted.map((d) => (
            <Cell key={d.name} fill={colorScale.get(d.name)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HrAnalyticsDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <Card title="Workforce overview" subtitle="HR Analytics dataset — 1,470 employee records">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatTile label="Headcount" value={HR_SUMMARY.headcount.toLocaleString("en-IN")} />
          <StatTile label="Attrition" value={HR_SUMMARY.attritionCount.toLocaleString("en-IN")} />
          <StatTile label="Attrition Rate" value={`${HR_SUMMARY.attritionRatePct}%`} />
          <StatTile label="Avg Age" value={`${HR_SUMMARY.avgAge}`} />
          <StatTile label="Avg Monthly Income" value={HR_SUMMARY.avgMonthlyIncome.toLocaleString("en-IN", { maximumFractionDigits: 1 })} />
          <StatTile label="Avg Tenure" value={`${HR_SUMMARY.avgTenureYears} yrs`} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Attrition by gender">
          <CountBarChart dimension="hr-gender" data={ATTRITION_BY_GENDER} />
        </Card>
        <Card title="Attrition by education field">
          <CountBarChart
            dimension="hr-education"
            data={ATTRITION_BY_EDUCATION_FIELD.map((d) => ({ name: d.name, count: d.pct }))}
            layout="horizontal"
            height={220}
            unit="%"
            valueLabel="Share"
          />
        </Card>
        <Card title="Attrition by age group">
          <CountBarChart dimension="hr-age" data={ATTRITION_BY_AGE_GROUP} />
        </Card>
        <Card title="Attrition by salary band">
          <CountBarChart dimension="hr-salary" data={ATTRITION_BY_SALARY_SLAB} layout="horizontal" height={200} />
        </Card>
      </div>

      <Card title="Attrition by job role">
        <CountBarChart dimension="hr-role" data={ATTRITION_BY_JOB_ROLE} layout="horizontal" height={280} />
      </Card>
    </div>
  );
}
