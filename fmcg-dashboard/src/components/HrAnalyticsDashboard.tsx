"use client";

import { useMemo, useState } from "react";
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
import { Kpi } from "./KpiCards";
import { ChartTooltip } from "./charts/ChartTooltip";
import { FilterGroup } from "./FilterControls";
import { TimeRangeToggle } from "./TimeRangeToggle";
import { entityColorScale } from "@/lib/palette";
import { formatNumber, formatPct, monthLabel } from "@/lib/format";
import { monthlyTrendDirection } from "@/lib/trend";
import { TIME_RANGES, type TimeRangeId } from "@/lib/timeRange";
import {
  ATTRITION_BY_AGE_GROUP,
  ATTRITION_BY_EDUCATION_FIELD,
  ATTRITION_BY_GENDER,
  ATTRITION_BY_JOB_ROLE,
  ATTRITION_BY_SALARY_SLAB,
  HR_MONTHLY_TREND,
  HR_SUMMARY,
} from "@/lib/hrAnalytics";

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

/** Scales a breakdown's counts to a given period's total attrition while
 * keeping its category mix identical to the full dataset -- there's no
 * real per-period breakdown to draw from, only a per-period total. */
function scaleCounts(data: { name: string; count: number }[], ratio: number) {
  return data.map((d) => ({ name: d.name, count: Math.max(0, Math.round(d.count * ratio)) }));
}

export function HrAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRangeId>("present");

  const current = useMemo(() => {
    const activeRange = TIME_RANGES.find((r) => r.id === timeRange)!;
    const windowed = activeRange.year
      ? HR_MONTHLY_TREND.filter((m) => m.month.startsWith(String(activeRange.year)))
      : activeRange.monthsBack
        ? HR_MONTHLY_TREND.slice(-activeRange.monthsBack)
        : HR_MONTHLY_TREND; // "custom" has no date pickers here -- falls back to the full run
    const point = windowed[windowed.length - 1] ?? HR_MONTHLY_TREND[HR_MONTHLY_TREND.length - 1];
    return {
      point,
      trend: (key: keyof typeof point) => monthlyTrendDirection(windowed, key),
    };
  }, [timeRange]);

  const ratio = current.point.attritionCount / HR_SUMMARY.attritionCount;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--chart-surface)] p-3">
        <FilterGroup label="Time">
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
        </FilterGroup>
      </div>

      <Card
        title="Workforce overview"
        subtitle={`HR Analytics dataset — ${monthLabel(current.point.month)}`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Kpi label="Headcount" value={formatNumber(current.point.headcount)} trend={current.trend("headcount")} />
          <Kpi label="Attrition" value={formatNumber(current.point.attritionCount)} trend={current.trend("attritionCount")} />
          <Kpi
            label="Attrition Rate"
            value={formatPct(current.point.attritionRatePct)}
            trend={current.trend("attritionRatePct")}
          />
          <Kpi label="Avg Age" value={`${current.point.avgAge}`} trend={current.trend("avgAge")} />
          <Kpi
            label="Avg Monthly Income"
            value={current.point.avgMonthlyIncome.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
            trend={current.trend("avgMonthlyIncome")}
          />
          <Kpi label="Avg Tenure" value={`${current.point.avgTenureYears} yrs`} trend={current.trend("avgTenureYears")} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Attrition by gender">
          <CountBarChart dimension="hr-gender" data={scaleCounts(ATTRITION_BY_GENDER, ratio)} />
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
          <CountBarChart dimension="hr-age" data={scaleCounts(ATTRITION_BY_AGE_GROUP, ratio)} />
        </Card>
        <Card title="Attrition by salary band">
          <CountBarChart
            dimension="hr-salary"
            data={scaleCounts(ATTRITION_BY_SALARY_SLAB, ratio)}
            layout="horizontal"
            height={200}
          />
        </Card>
      </div>

      <Card title="Attrition by job role">
        <CountBarChart dimension="hr-role" data={scaleCounts(ATTRITION_BY_JOB_ROLE, ratio)} layout="horizontal" height={280} />
      </Card>
    </div>
  );
}
