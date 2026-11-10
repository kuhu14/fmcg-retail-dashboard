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
import { FilterGroup, FilterSelect } from "./FilterControls";
import { TimeRangeToggle } from "./TimeRangeToggle";
import { entityColorScale } from "@/lib/palette";
import { formatNumber, formatPct, monthLabel } from "@/lib/format";
import { monthlyTrendDirection } from "@/lib/trend";
import { TIME_RANGES, type TimeRangeId } from "@/lib/timeRange";
import { useChartClickFilter } from "@/hooks/useChartClickFilter";
import {
  ATTRITION_BY_AGE_GROUP,
  ATTRITION_BY_EDUCATION_FIELD,
  ATTRITION_BY_GENDER,
  ATTRITION_BY_JOB_ROLE,
  ATTRITION_BY_SALARY_SLAB,
  ATTRITION_BY_TENURE,
  HR_ATTRITION_ROWS,
  HR_FILTER_DIMENSIONS,
  HR_MONTHLY_TREND,
  HR_SUMMARY,
  type HrAttritionRow,
  type HrFilterDimension,
} from "@/lib/hrAnalytics";

type HrFilterState = Partial<Record<HrFilterDimension, string>>;

function CountBarChart({
  dimension,
  data,
  layout = "vertical",
  height = 220,
  unit = "",
  valueLabel = "Attrition",
  activeName,
  onBarClick,
}: {
  dimension: string;
  data: { name: string; count: number }[];
  layout?: "vertical" | "horizontal";
  height?: number;
  /** Appended to axis ticks and tooltip values, e.g. "%" for share charts. */
  unit?: string;
  valueLabel?: string;
  activeName?: string | null;
  onBarClick?: (name: string) => void;
}) {
  const colorScale = entityColorScale(dimension, data.map((d) => d.name).sort());
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const formatValue = (v: number) => `${v.toLocaleString("en-IN")}${unit}`;
  const opacityFor = (name: string) => (activeName && activeName !== name ? 0.35 : 1);

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
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
            cursor={onBarClick ? "pointer" : undefined}
            onClick={(d) => onBarClick?.((d as unknown as { name: string }).name)}
          >
            {sorted.map((d) => (
              <Cell key={d.name} fill={colorScale.get(d.name)} opacity={opacityFor(d.name)} />
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
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
          cursor={onBarClick ? "pointer" : undefined}
          onClick={(d) => onBarClick?.((d as unknown as { name: string }).name)}
        >
          {sorted.map((d) => (
            <Cell key={d.name} fill={colorScale.get(d.name)} opacity={opacityFor(d.name)} />
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

function matchesFilters(row: HrAttritionRow, filters: HrFilterState, excludeKey?: HrFilterDimension): boolean {
  return (Object.keys(filters) as HrFilterDimension[]).every((key) => {
    if (key === excludeKey) return true;
    const want = filters[key];
    return !want || row[key] === want;
  });
}

/** Counts rows for one dimension, under every *other* active filter -- the
 * dimension's own chart shows all its options (the active one highlighted)
 * rather than collapsing to a single bar when you filter on itself. */
function countsForDimension(
  rows: HrAttritionRow[],
  key: HrFilterDimension,
  labels: { name: string }[],
  filters: HrFilterState
): { name: string; count: number }[] {
  const tally = new Map(labels.map((l) => [l.name, 0]));
  for (const row of rows) {
    if (!matchesFilters(row, filters, key)) continue;
    const value = row[key];
    if (tally.has(value)) tally.set(value, (tally.get(value) ?? 0) + 1);
  }
  return labels.map((l) => ({ name: l.name, count: tally.get(l.name) ?? 0 }));
}

export function HrAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRangeId>("present");
  const [filters, setFilters] = useState<HrFilterState>({});

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

  const setFilter = (key: HrFilterDimension, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  const applyChartFilter = useChartClickFilter<HrFilterState>(setFilters);
  const resetFilters = () => setFilters({});

  const filteredAttritionCount = useMemo(
    () => Math.round(HR_ATTRITION_ROWS.filter((r) => matchesFilters(r, filters)).length * ratio),
    [filters, ratio]
  );

  const hasActiveFilter = Object.values(filters).some(Boolean);

  const genderData = scaleCounts(countsForDimension(HR_ATTRITION_ROWS, "gender", ATTRITION_BY_GENDER, filters), ratio);
  const ageGroupData = scaleCounts(countsForDimension(HR_ATTRITION_ROWS, "ageGroup", ATTRITION_BY_AGE_GROUP, filters), ratio);
  const salaryBandData = scaleCounts(countsForDimension(HR_ATTRITION_ROWS, "salaryBand", ATTRITION_BY_SALARY_SLAB, filters), ratio);
  const jobRoleData = scaleCounts(countsForDimension(HR_ATTRITION_ROWS, "jobRole", ATTRITION_BY_JOB_ROLE, filters), ratio);
  const tenureData = scaleCounts(countsForDimension(HR_ATTRITION_ROWS, "tenureBand", ATTRITION_BY_TENURE, filters), ratio);

  const educationRaw = countsForDimension(HR_ATTRITION_ROWS, "educationField", ATTRITION_BY_EDUCATION_FIELD, filters);
  const educationTotal = educationRaw.reduce((s, d) => s + d.count, 0) || 1;
  const educationData = educationRaw.map((d) => ({ name: d.name, count: Math.round((d.count / educationTotal) * 1000) / 10 }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--chart-surface)] p-3">
        <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
          <FilterGroup label="Time">
            <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          </FilterGroup>
          <FilterGroup label="Attrition profile">
            {HR_FILTER_DIMENSIONS.map((dim) => (
              <FilterSelect
                key={dim.key}
                label={dim.label}
                value={filters[dim.key] ?? ""}
                onChange={(v) => setFilter(dim.key, v)}
                options={dim.options.map((name) => ({ value: name, label: name }))}
                sort={false}
              />
            ))}
          </FilterGroup>
        </div>
      </div>

      {hasActiveFilter && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Focused on:</span>
          {HR_FILTER_DIMENSIONS.filter((dim) => filters[dim.key]).map((dim) => (
            <span
              key={dim.key}
              className="text-xs rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 font-medium"
            >
              {dim.label}: {filters[dim.key]}
            </span>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto text-xs font-medium rounded-md border border-[var(--card-border)] px-2.5 py-1 text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40"
          >
            Reset
          </button>
        </div>
      )}

      <Card
        title="Workforce overview"
        subtitle={`HR Analytics dataset — ${monthLabel(current.point.month)}`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Kpi label="Headcount" value={formatNumber(current.point.headcount)} trend={current.trend("headcount")} />
          <Kpi label="Attrition" value={formatNumber(filteredAttritionCount)} trend={hasActiveFilter ? null : current.trend("attritionCount")} />
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
          <CountBarChart
            dimension="hr-gender"
            data={genderData}
            activeName={filters.gender ?? null}
            onBarClick={(name) => applyChartFilter({ gender: name })}
          />
        </Card>
        <Card title="Attrition by education field">
          <CountBarChart
            dimension="hr-education"
            data={educationData}
            layout="horizontal"
            height={220}
            unit="%"
            valueLabel="Share"
            activeName={filters.educationField ?? null}
            onBarClick={(name) => applyChartFilter({ educationField: name })}
          />
        </Card>
        <Card title="Attrition by age group">
          <CountBarChart
            dimension="hr-age"
            data={ageGroupData}
            activeName={filters.ageGroup ?? null}
            onBarClick={(name) => applyChartFilter({ ageGroup: name })}
          />
        </Card>
        <Card title="Attrition by tenure">
          <CountBarChart
            dimension="hr-tenure"
            data={tenureData}
            activeName={filters.tenureBand ?? null}
            onBarClick={(name) => applyChartFilter({ tenureBand: name })}
          />
        </Card>
        <Card title="Attrition by salary band">
          <CountBarChart
            dimension="hr-salary"
            data={salaryBandData}
            layout="horizontal"
            height={200}
            activeName={filters.salaryBand ?? null}
            onBarClick={(name) => applyChartFilter({ salaryBand: name })}
          />
        </Card>
        <Card title="Attrition by job role">
          <CountBarChart
            dimension="hr-role"
            data={jobRoleData}
            layout="horizontal"
            height={280}
            activeName={filters.jobRole ?? null}
            onBarClick={(name) => applyChartFilter({ jobRole: name })}
          />
        </Card>
      </div>
    </div>
  );
}
