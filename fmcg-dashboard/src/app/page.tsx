"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Insight, IntlSummary, RecordFilter, Summary } from "@/lib/types";
import { useGlobalRecordCount, useSummary } from "@/hooks/useApi";
import { useIntlSummary } from "@/hooks/useIntlApi";
import { useHrEvents } from "@/hooks/useHrEvents";
import { daysUntil, formatEventDate, getNextEvent } from "@/lib/hrEvents";
import { API_BASE_URL } from "@/lib/api";
import { DEPARTMENTS, type DepartmentId } from "@/lib/departments";
import { Kpi } from "@/components/KpiCards";
import { InsightCards } from "@/components/InsightCards";
import { DataSourceInfo } from "@/components/DataSourceInfo";
import { DrillDownTable } from "@/components/DrillDownTable";
import { Card } from "@/components/Card";
import { ComingSoon } from "@/components/ComingSoon";
import { InternationalDashboard } from "@/components/InternationalDashboard";
import { HrDashboard } from "@/components/HrDashboard";
import { DepartmentTopLine, type TopLineItem } from "@/components/DepartmentTopLine";
import { FilterBar } from "@/components/FilterBar";
import { FilterPanel } from "@/components/FilterPanel";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { MixDonutChart } from "@/components/charts/MixDonutChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { InventoryRiskChart } from "@/components/charts/InventoryRiskChart";
import { formatINR, formatNumber, formatPct, formatUSD } from "@/lib/format";
import { monthlyTrendDirection } from "@/lib/trend";
import { TIME_RANGES, type TimeRangeId } from "@/lib/timeRange";

const EMPTY_FILTER: RecordFilter = {};

function sameFilter(a: RecordFilter, b: RecordFilter): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function Home() {
  const [activeDept, setActiveDept] = useState<DepartmentId>("overview");
  // Each department keeps its own filter so clicking a bar in Finance never
  // touches what Sales or Overview are showing, and switching tabs doesn't
  // carry a filter over to an unrelated department.
  const [filtersByDept, setFiltersByDept] = useState<Partial<Record<DepartmentId, RecordFilter>>>({});
  // One toggle for the whole dashboard (not per-department, unlike the bar/
  // insight filters above) -- it narrows what every department means by
  // "the data" at once.
  const [timeRange, setTimeRange] = useState<TimeRangeId>("2024");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const { events: hrEvents } = useHrEvents();
  const tableRef = useRef<HTMLDivElement>(null);

  const dept = useMemo(() => DEPARTMENTS.find((d) => d.id === activeDept)!, [activeDept]);
  const filter = filtersByDept[activeDept] ?? EMPTY_FILTER;
  const activeRange = TIME_RANGES.find((r) => r.id === timeRange)!;
  const timeFilter: RecordFilter =
    timeRange === "custom"
      ? { ...(customFrom && { dateFrom: customFrom }), ...(customTo && { dateTo: customTo }) }
      : activeRange.year
        ? { year: activeRange.year }
        : activeRange.monthsBack
          ? { monthsBack: activeRange.monthsBack }
          : EMPTY_FILTER;
  const hasTimeFilter = Object.keys(timeFilter).length > 0;
  const effectiveFilter: RecordFilter = hasTimeFilter ? { ...filter, ...timeFilter } : filter;

  const setFilter = useCallback(
    (next: RecordFilter | ((prev: RecordFilter) => RecordFilter)) => {
      setFiltersByDept((prev) => {
        const current = prev[activeDept] ?? EMPTY_FILTER;
        const resolved = typeof next === "function" ? next(current) : next;
        return { ...prev, [activeDept]: resolved };
      });
    },
    [activeDept]
  );

  const { summary: data, loading, error } = useSummary(effectiveFilter);
  const globalRecordCount = useGlobalRecordCount(timeFilter);
  // Unfiltered -- just to power the department top-line row on Overview.
  const { summary: intlData } = useIntlSummary();

  function applyInsight(insight: Insight) {
    setFilter((prev) => (sameFilter(prev, insight.filter) ? EMPTY_FILTER : insight.filter));
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyChartFilter(patch: RecordFilter) {
    setFilter((prev) => {
      const key = Object.keys(patch)[0] as keyof RecordFilter;
      if (prev[key] === patch[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, ...patch };
    });
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetFilter() {
    setFilter(EMPTY_FILTER);
  }

  function setFilterField(key: keyof RecordFilter, raw: string) {
    setFilter((prev) => {
      const next: RecordFilter = { ...prev };
      if (!raw) {
        delete next[key];
      } else if (key === "loyalty") {
        next.loyalty = Number(raw) as 0 | 1;
      } else {
        (next as Record<string, string>)[key] = raw;
      }
      return next;
    });
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Can&apos;t reach the API
          </h1>
          <p className="text-sm text-[var(--chart-muted)]">
            Failed to load data from <code className="font-mono">{API_BASE_URL}</code>. Make sure
            the FastAPI backend is running:
          </p>
          <pre className="mt-3 text-left text-xs bg-[var(--chart-gridline)]/30 rounded-md p-3 overflow-x-auto">
{`cd backend
.\\venv\\Scripts\\python.exe -m uvicorn app.main:app --port 8000`}
          </pre>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-[var(--chart-muted)]">Loading dashboard…</span>
      </div>
    );
  }

  const insights = dept.insightIds
    ? data.insights.filter((i) => dept.insightIds!.includes(i.id))
    : data.insights;
  const activeInsightId = insights.find((i) => sameFilter(i.filter, filter))?.id ?? null;
  const hasDimensionFilter = Object.keys(filter).some((k) => k !== "search" && filter[k as keyof RecordFilter] !== undefined);
  const hasActiveFilter = hasDimensionFilter || hasTimeFilter;
  const trendOf = (key: keyof Summary["monthlyTrend"][number]) =>
    monthlyTrendDirection(data.monthlyTrend, key);
  const intlTrendOf = (key: keyof IntlSummary["monthlyTrend"][number]) =>
    intlData ? monthlyTrendDirection(intlData.monthlyTrend, key) : null;

  const topLineItems: TopLineItem[] = [
    {
      id: "finance",
      label: "Finance",
      value: formatINR(data.totals.revenue, { compact: true }),
      sub: "Total revenue",
      trend: trendOf("revenue"),
    },
    {
      id: "sales",
      label: "Sales & Channel",
      value: formatNumber(data.totals.orders),
      sub: "Orders",
      trend: trendOf("orders"),
    },
    {
      id: "supply-chain",
      label: "Supply Chain",
      value: formatNumber(data.inventory.stockoutRisk),
      sub: "Stockout risk",
      trend: trendOf("stockoutRisk"),
    },
    {
      id: "customer",
      label: "Customer & Marketing",
      value: formatPct(data.totals.loyaltyPct),
      sub: "Loyalty members",
      trend: trendOf("loyaltyPct"),
    },
    {
      id: "exports",
      label: "International / Exports",
      value: intlData ? formatUSD(intlData.totals.revenue, { compact: true }) : "--",
      sub: "Total revenue",
      trend: intlTrendOf("revenue"),
    },
    {
      id: "hr",
      label: "HR",
      value: "2 tools",
      sub: "Calendar · Hiring Assistant",
    },
  ];

  return (
    <div className="min-h-screen md:flex">
      <Sidebar activeId={activeDept} onSelect={setActiveDept} />

      <div className="flex-1 min-w-0">
        <header className="border-b border-[var(--card-border)] sticky top-0 z-10 backdrop-blur bg-[var(--background)]/85">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-[var(--foreground)]">{dept.label}</h1>
              <p className="text-xs text-[var(--chart-muted)]">
                {dept.id === "exports" || dept.id === "hr"
                  ? dept.description
                  : dept.id === "overview" && !hasActiveFilter
                    ? `India · Calendar Year 2024 · ${data.meta.recordCount.toLocaleString("en-IN")} transactions across 8 cities`
                    : hasActiveFilter
                      ? `${data.meta.recordCount.toLocaleString("en-IN")} matching transactions`
                      : dept.description}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
          {dept.id === "exports" ? (
            <InternationalDashboard />
          ) : dept.id === "hr" ? (
            <HrDashboard />
          ) : dept.comingSoon ? (
            <ComingSoon label={dept.label} description={dept.description} />
          ) : (
            <>
              <FilterPanel
                filter={filter}
                onFieldChange={setFilterField}
                data={data}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                customFrom={customFrom}
                customTo={customTo}
                onCustomFromChange={setCustomFrom}
                onCustomToChange={setCustomTo}
              />
              <FilterBar filter={filter} onReset={resetFilter} />

              {dept.id === "overview" && (
                <DepartmentTopLine items={topLineItems} onSelect={setActiveDept} />
              )}

              <section>
                {dept.id === "overview" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Kpi
                      label="Total Revenue"
                      value={formatINR(data.totals.revenue, { compact: true })}
                      sub={`${formatNumber(data.totals.orders)} orders`}
                      trend={trendOf("revenue")}
                    />
                    <Kpi
                      label="Gross Margin"
                      value={formatPct(data.totals.marginPct, 2)}
                      sub={formatINR(data.totals.margin, { compact: true })}
                      trend={trendOf("marginPct")}
                    />
                    <Kpi
                      label="Avg Order Value"
                      value={formatINR(data.totals.avgOrderValue)}
                      sub={`${formatNumber(data.totals.units)} units sold`}
                      trend={trendOf("avgOrderValue")}
                    />
                    <Kpi
                      label="Loyalty Members"
                      value={formatPct(data.totals.loyaltyPct)}
                      sub={`${formatNumber(data.totals.loyaltyCount)} of ${formatNumber(data.totals.orders)}`}
                      trend={trendOf("loyaltyPct")}
                    />
                    <Kpi
                      label="Stockout Risk"
                      value={formatNumber(data.inventory.stockoutRisk)}
                      sub={`${formatPct(data.inventory.stockoutRiskPct)} of line items`}
                      trend={trendOf("stockoutRisk")}
                    />
                    <Kpi
                      label="Overstocked"
                      value={formatPct(data.inventory.overstockPct)}
                      sub={`avg lead time ${data.inventory.avgLeadTimeDays}d`}
                      trend={trendOf("overstockPct")}
                    />
                  </div>
                )}

                {dept.id === "finance" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Kpi
                      label="Total Revenue"
                      value={formatINR(data.totals.revenue, { compact: true })}
                      sub={`${formatNumber(data.totals.orders)} orders`}
                      trend={trendOf("revenue")}
                    />
                    <Kpi
                      label="Total Cost"
                      value={formatINR(data.totals.cost, { compact: true })}
                      trend={trendOf("cost")}
                    />
                    <Kpi
                      label="Gross Margin"
                      value={formatPct(data.totals.marginPct, 2)}
                      sub={formatINR(data.totals.margin, { compact: true })}
                      trend={trendOf("marginPct")}
                    />
                    <Kpi
                      label="Avg Order Value"
                      value={formatINR(data.totals.avgOrderValue)}
                      trend={trendOf("avgOrderValue")}
                    />
                  </div>
                )}

                {dept.id === "sales" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Kpi
                      label="Total Revenue"
                      value={formatINR(data.totals.revenue, { compact: true })}
                      trend={trendOf("revenue")}
                    />
                    <Kpi label="Orders" value={formatNumber(data.totals.orders)} trend={trendOf("orders")} />
                    <Kpi label="Units Sold" value={formatNumber(data.totals.units)} trend={trendOf("units")} />
                    <Kpi
                      label="Avg Order Value"
                      value={formatINR(data.totals.avgOrderValue)}
                      trend={trendOf("avgOrderValue")}
                    />
                  </div>
                )}

                {dept.id === "supply-chain" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Kpi
                      label="Stockout Risk"
                      value={formatNumber(data.inventory.stockoutRisk)}
                      sub={`${formatPct(data.inventory.stockoutRiskPct)} of line items`}
                      trend={trendOf("stockoutRisk")}
                    />
                    <Kpi
                      label="Critical Stock"
                      value={formatNumber(data.inventory.criticalStock)}
                      sub="below half of reorder level"
                      trend={trendOf("criticalStock")}
                    />
                    <Kpi
                      label="Overstocked"
                      value={formatPct(data.inventory.overstockPct)}
                      sub={formatNumber(data.inventory.overstock)}
                      trend={trendOf("overstockPct")}
                    />
                    <Kpi
                      label="Avg Lead Time"
                      value={`${data.inventory.avgLeadTimeDays}d`}
                      trend={trendOf("avgLeadTimeDays")}
                    />
                  </div>
                )}

                {dept.id === "customer" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Kpi
                      label="Loyalty Members"
                      value={formatPct(data.totals.loyaltyPct)}
                      sub={`${formatNumber(data.totals.loyaltyCount)} of ${formatNumber(data.totals.orders)}`}
                      trend={trendOf("loyaltyPct")}
                    />
                    <Kpi
                      label="Avg Order Value (Loyalty)"
                      value={formatINR(
                        data.byLoyalty.find((l) => l.loyalty === 1)?.avgOrderValue ?? 0
                      )}
                      trend={trendOf("avgOrderValueLoyal")}
                    />
                    <Kpi
                      label="Avg Order Value (Non-loyalty)"
                      value={formatINR(
                        data.byLoyalty.find((l) => l.loyalty === 0)?.avgOrderValue ?? 0
                      )}
                      trend={trendOf("avgOrderValueNonLoyal")}
                    />
                    <Kpi
                      label="Age Missing"
                      value={formatPct(data.totals.ageMissingPct)}
                      sub={`${formatNumber(data.totals.ageMissing)} orders`}
                      trend={trendOf("ageMissingPct")}
                    />
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                  Actionable insights
                </h2>
                <InsightCards
                  insights={insights}
                  activeInsightId={activeInsightId}
                  onApply={applyInsight}
                />
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(dept.id === "overview" || dept.id === "sales") && (
                  <Card title="Revenue by category" subtitle="Click a bar to filter the table below">
                    <RevenueBarChart
                      dimension="category"
                      data={data.byCategory.map((c) => ({
                        name: c.category,
                        revenue: c.revenue,
                        marginPct: c.marginPct,
                        orders: c.orders,
                      }))}
                      activeName={filter.category ?? null}
                      onBarClick={(name) => applyChartFilter({ category: name })}
                    />
                  </Card>
                )}

                {(dept.id === "overview" || dept.id === "sales") && (
                  <Card title="Revenue by city" subtitle="Click a bar to filter the table below">
                    <RevenueBarChart
                      dimension="city"
                      data={data.byCity.map((c) => ({
                        name: c.city,
                        revenue: c.revenue,
                        marginPct: c.marginPct,
                        orders: c.orders,
                      }))}
                      activeName={filter.city ?? null}
                      onBarClick={(name) => applyChartFilter({ city: name })}
                    />
                  </Card>
                )}

                {(dept.id === "overview" || dept.id === "sales" || dept.id === "finance") && (
                  <Card title="Monthly revenue trend" subtitle="2024 · click a point to jump to that month">
                    <TrendChart
                      data={data.monthlyTrend}
                      activeMonth={filter.month ?? null}
                      onPointClick={(month) => applyChartFilter({ month })}
                    />
                  </Card>
                )}

                {(dept.id === "overview" || dept.id === "supply-chain") && (
                  <Card title="Inventory risk by category" subtitle="Line items at or below reorder level">
                    <InventoryRiskChart
                      data={data.inventory.byCategory.map((c) => ({ name: c.category, atRiskOrders: c.atRiskOrders }))}
                      activeName={filter.category ?? null}
                      onBarClick={(name) => applyChartFilter({ category: name })}
                    />
                  </Card>
                )}

                {dept.id === "supply-chain" && (
                  <Card title="Inventory risk by city" subtitle="Line items at or below reorder level">
                    <InventoryRiskChart
                      data={data.inventory.byCity.map((c) => ({ name: c.city, atRiskOrders: c.atRiskOrders }))}
                      activeName={filter.city ?? null}
                      onBarClick={(name) => applyChartFilter({ city: name })}
                    />
                  </Card>
                )}

                {(dept.id === "overview" || dept.id === "sales") && (
                  <Card title="Channel mix" subtitle="Share of revenue">
                    <MixDonutChart
                      dimension="channel"
                      data={data.byChannel.map((c) => ({ name: c.channel, revenue: c.revenue, orders: c.orders }))}
                      activeName={filter.channel ?? null}
                      onSliceClick={(name) => applyChartFilter({ channel: name })}
                    />
                  </Card>
                )}

                {(dept.id === "overview" || dept.id === "finance") && (
                  <Card title="Payment mode mix" subtitle="Share of revenue">
                    <MixDonutChart
                      dimension="paymentMode"
                      data={data.byPaymentMode.map((c) => ({ name: c.paymentMode, revenue: c.revenue, orders: c.orders }))}
                      activeName={filter.paymentMode ?? null}
                      onSliceClick={(name) => applyChartFilter({ paymentMode: name })}
                    />
                  </Card>
                )}

                {dept.id === "customer" && (
                  <Card title="Revenue by gender" subtitle="Share of revenue">
                    <MixDonutChart
                      dimension="gender"
                      data={data.byGender.map((g) => ({ name: g.gender, revenue: g.revenue, orders: g.orders }))}
                      activeName={filter.gender ?? null}
                      onSliceClick={(name) => applyChartFilter({ gender: name })}
                    />
                  </Card>
                )}

                {dept.id === "customer" && (
                  <Card title="Loyalty mix" subtitle="Share of revenue">
                    <MixDonutChart
                      dimension="loyalty"
                      data={data.byLoyalty.map((l) => ({
                        name: l.loyalty === 1 ? "Loyalty members" : "Non-loyalty",
                        revenue: l.revenue,
                        orders: l.orders,
                      }))}
                      activeName={filter.loyalty === undefined ? null : filter.loyalty === 1 ? "Loyalty members" : "Non-loyalty"}
                      onSliceClick={(name) => applyChartFilter({ loyalty: name === "Loyalty members" ? 1 : 0 })}
                    />
                  </Card>
                )}
              </section>

              <section ref={tableRef}>
                <DrillDownTable
                  totalRecords={globalRecordCount ?? data.meta.recordCount}
                  filter={filter}
                  onFilterChange={setFilter}
                  extraFilter={timeFilter}
                />
              </section>

              {dept.id === "overview" && (
                <section>
                  <DataSourceInfo summary={data} />
                </section>
              )}
            </>
          )}

          <footer className="text-center text-[11px] text-[var(--chart-muted)] py-4">
            Built with Next.js client components · Served live by FastAPI + SQLite ({API_BASE_URL})
          </footer>
        </main>
      </div>
    </div>
  );
}
