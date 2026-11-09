"use client";

import { useRef, useState } from "react";
import type { IntlFilter, IntlInsight } from "@/lib/types";
import { useIntlSummary } from "@/hooks/useIntlApi";
import { Kpi } from "./KpiCards";
import { InsightCards } from "./InsightCards";
import { Card } from "./Card";
import { FilterGroup, FilterSelect } from "./FilterControls";
import { IntlDrillDownTable } from "./IntlDrillDownTable";
import { RevenueBarChart } from "./charts/RevenueBarChart";
import { MixDonutChart } from "./charts/MixDonutChart";
import { formatNumber, formatUSD } from "@/lib/format";
import { monthlyTrendDirection } from "@/lib/trend";

const EMPTY_FILTER: IntlFilter = {};

function sameFilter(a: IntlFilter, b: IntlFilter): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function InternationalDashboard() {
  const [filter, setFilter] = useState<IntlFilter>(EMPTY_FILTER);
  const tableRef = useRef<HTMLDivElement>(null);
  const { summary: data, loading, error } = useIntlSummary(filter);

  function setFilterField(key: keyof IntlFilter, raw: string) {
    setFilter((prev) => {
      const next: IntlFilter = { ...prev };
      if (!raw) {
        delete next[key];
      } else if (key === "year" || key === "quarter") {
        next[key] = Number(raw);
      } else {
        (next as Record<string, string>)[key] = raw;
      }
      return next;
    });
  }

  function applyChartFilter(patch: IntlFilter) {
    setFilter((prev) => {
      const key = Object.keys(patch)[0] as keyof IntlFilter;
      if (prev[key] === patch[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, ...patch };
    });
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyInsight(insight: IntlInsight) {
    setFilter((prev) => (sameFilter(prev, insight.filter) ? EMPTY_FILTER : insight.filter));
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (error) {
    return (
      <Card title="Can't reach the API">
        <p className="text-xs text-[var(--chart-muted)]">{error}</p>
      </Card>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-[var(--chart-muted)]">Loading international data…</span>
      </div>
    );
  }

  const activeInsightId = data.insights.find((i) => sameFilter(i.filter, filter))?.id ?? null;
  const hasActiveFilter = Object.keys(filter).some((k) => k !== "search" && filter[k as keyof IntlFilter] !== undefined);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Countries"
            value={filter.country ?? ""}
            onChange={(v) => setFilterField("country", v)}
            options={data.byCountry.map((c) => ({ value: c.country, label: c.country }))}
          />
          <FilterSelect
            label="Categories"
            value={filter.category ?? ""}
            onChange={(v) => setFilterField("category", v)}
            options={data.byCategory.map((c) => ({ value: c.category, label: c.category }))}
          />
          <FilterSelect
            label="Payment Methods"
            value={filter.paymentMethod ?? ""}
            onChange={(v) => setFilterField("paymentMethod", v)}
            options={data.byPaymentMethod.map((p) => ({ value: p.paymentMethod, label: p.paymentMethod }))}
          />
          <FilterSelect
            label="Generations"
            value={filter.generation ?? ""}
            onChange={(v) => setFilterField("generation", v)}
            options={data.byGeneration.map((g) => ({ value: g.generation, label: g.generation }))}
          />
          <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-0.5">
            {[
              { label: "Last Year", year: 2024 },
              { label: "Present Year", year: 2025 },
            ].map((opt) => {
              const active = filter.year === opt.year;
              return (
                <button
                  key={opt.year}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilterField("year", active ? "" : String(opt.year))}
                  className={`px-2.5 h-7 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <FilterSelect
            label="Years"
            value={filter.year !== undefined ? String(filter.year) : ""}
            onChange={(v) => setFilterField("year", v)}
            options={data.yearlyTrend.map((y) => ({ value: y.year, label: y.year }))}
          />
          <FilterSelect
            label="Quarters"
            value={filter.quarter !== undefined ? String(filter.quarter) : ""}
            onChange={(v) => setFilterField("quarter", v)}
            options={[
              { value: "1", label: "Q1 (Jan–Mar)" },
              { value: "2", label: "Q2 (Apr–Jun)" },
              { value: "3", label: "Q3 (Jul–Sep)" },
              { value: "4", label: "Q4 (Oct–Dec)" },
            ]}
          />
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => setFilter(EMPTY_FILTER)}
              className="ml-auto text-xs font-medium rounded-md border border-[var(--card-border)] px-2.5 py-1.5 text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40"
            >
              Reset
            </button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Total Revenue" value={formatUSD(data.totals.revenue, { compact: true })} sub={`${formatNumber(data.totals.orders)} orders`} />
        <Kpi label="Orders" value={formatNumber(data.totals.orders)} />
        <Kpi label="Avg Order Value" value={formatUSD(data.totals.avgOrderValue)} />
        <Kpi label="Units Sold" value={formatNumber(data.totals.units)} />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Actionable insights</h2>
        <InsightCards insights={data.insights} activeInsightId={activeInsightId} onApply={applyInsight} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Revenue by country" subtitle="Click a bar to filter the table below">
          <RevenueBarChart
            dimension="country"
            data={data.byCountry.map((c) => ({ name: c.country, revenue: c.revenue, orders: c.orders }))}
            activeName={filter.country ?? null}
            onBarClick={(name) => applyChartFilter({ country: name })}
            formatValue={(v) => formatUSD(v, { compact: true })}
          />
        </Card>
        <Card title="Revenue by category" subtitle="Share of revenue">
          <MixDonutChart
            dimension="category"
            data={data.byCategory.map((c) => ({ name: c.category, revenue: c.revenue, orders: c.orders }))}
            activeName={filter.category ?? null}
            onSliceClick={(name) => applyChartFilter({ category: name })}
            formatValue={(v) => formatUSD(v, { compact: true })}
          />
        </Card>
        <Card title="Revenue by generation" subtitle="Share of revenue">
          <MixDonutChart
            dimension="generation"
            data={data.byGeneration.map((g) => ({ name: g.generation, revenue: g.revenue, orders: g.orders }))}
            activeName={filter.generation ?? null}
            onSliceClick={(name) => applyChartFilter({ generation: name })}
            formatValue={(v) => formatUSD(v, { compact: true })}
          />
        </Card>
        <Card title="Payment method mix" subtitle="Share of revenue">
          <MixDonutChart
            dimension="paymentMethod"
            data={data.byPaymentMethod.map((p) => ({ name: p.paymentMethod, revenue: p.revenue, orders: p.orders }))}
            activeName={filter.paymentMethod ?? null}
            onSliceClick={(name) => applyChartFilter({ paymentMethod: name })}
            formatValue={(v) => formatUSD(v, { compact: true })}
          />
        </Card>
        <Card title="Yearly revenue" subtitle="2026 is partial (Jan–Feb only)">
          <div className="flex flex-col gap-2">
            {data.yearlyTrend.map((y) => {
              const max = Math.max(...data.yearlyTrend.map((x) => x.revenue));
              const pct = max ? (y.revenue / max) * 100 : 0;
              return (
                <button
                  key={y.year}
                  type="button"
                  onClick={() => applyChartFilter({ year: Number(y.year) })}
                  className="flex items-center gap-2 text-left"
                >
                  <span className="w-10 text-xs text-[var(--chart-muted)]">{y.year}</span>
                  <span className="flex-1 h-5 rounded bg-[var(--chart-gridline)]/40 overflow-hidden">
                    <span
                      className="block h-full rounded bg-blue-500"
                      style={{
                        width: `${pct}%`,
                        opacity: filter.year && filter.year !== Number(y.year) ? 0.35 : 1,
                      }}
                    />
                  </span>
                  <span className="w-24 text-xs text-right tabular-nums text-[var(--foreground)]">
                    {formatUSD(y.revenue, { compact: true })}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      <section ref={tableRef}>
        <IntlDrillDownTable totalRecords={data.meta.recordCount} filter={filter} onFilterChange={setFilter} />
      </section>
    </div>
  );
}
