"use client";

import { useRef, useState } from "react";
import type { Insight, RecordFilter } from "@/lib/types";
import { useSummary } from "@/hooks/useApi";
import { API_BASE_URL } from "@/lib/api";
import { KpiCards } from "@/components/KpiCards";
import { InsightCards } from "@/components/InsightCards";
import { DataSourceInfo } from "@/components/DataSourceInfo";
import { DrillDownTable } from "@/components/DrillDownTable";
import { Card } from "@/components/Card";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { MixDonutChart } from "@/components/charts/MixDonutChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { InventoryRiskChart } from "@/components/charts/InventoryRiskChart";

export default function Home() {
  const { summary: data, loading, error } = useSummary();
  const [filter, setFilter] = useState<RecordFilter>({});
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  function applyInsight(insight: Insight) {
    setFilter(insight.filter);
    setActiveInsightId((prev) => (prev === insight.id ? null : insight.id));
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
    setActiveInsightId(null);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--card-border)] sticky top-0 z-10 backdrop-blur bg-[var(--background)]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              FMCG Retail Sales &amp; Inventory Dashboard
            </h1>
            <p className="text-xs text-[var(--chart-muted)]">
              India · Calendar Year 2024 · {data.meta.recordCount.toLocaleString("en-IN")} transactions across 8 cities
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <section>
          <KpiCards summary={data} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            Actionable insights
          </h2>
          <InsightCards
            insights={data.insights}
            activeInsightId={activeInsightId}
            onApply={applyInsight}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <Card title="Monthly revenue trend" subtitle="2024 · click a point to jump to that month">
            <TrendChart
              data={data.monthlyTrend}
              activeMonth={filter.month ?? null}
              onPointClick={(month) => applyChartFilter({ month })}
            />
          </Card>
          <Card title="Inventory risk by category" subtitle="Line items at or below reorder level">
            <InventoryRiskChart
              data={data.inventory.byCategory.map((c) => ({ name: c.category, atRiskOrders: c.atRiskOrders }))}
              activeName={filter.category ?? null}
              onBarClick={(name) => applyChartFilter({ category: name })}
            />
          </Card>
          <Card title="Channel mix" subtitle="Share of revenue">
            <MixDonutChart
              dimension="channel"
              data={data.byChannel.map((c) => ({ name: c.channel, revenue: c.revenue, orders: c.orders }))}
              activeName={filter.channel ?? null}
              onSliceClick={(name) => applyChartFilter({ channel: name })}
            />
          </Card>
          <Card title="Payment mode mix" subtitle="Share of revenue">
            <MixDonutChart
              dimension="paymentMode"
              data={data.byPaymentMode.map((c) => ({ name: c.paymentMode, revenue: c.revenue, orders: c.orders }))}
              activeName={filter.paymentMode ?? null}
              onSliceClick={(name) => applyChartFilter({ paymentMode: name })}
            />
          </Card>
        </section>

        <section ref={tableRef}>
          <DrillDownTable
            totalRecords={data.meta.recordCount}
            filter={filter}
            onFilterChange={setFilter}
          />
        </section>

        <section>
          <DataSourceInfo summary={data} />
        </section>

        <footer className="text-center text-[11px] text-[var(--chart-muted)] py-4">
          Built with Next.js client components · Served live by FastAPI + SQLite ({API_BASE_URL})
        </footer>
      </main>
    </div>
  );
}
