"use client";

import { useEffect, useState } from "react";
import type { IntlFilter, IntlRecord } from "@/lib/types";
import { exportIntlRecordsUrl, useIntlRecords } from "@/hooks/useIntlApi";
import { formatDate, formatNumber, formatUSD } from "@/lib/format";
import { Card } from "./Card";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const FILTER_LABELS: Record<string, (v: unknown) => string> = {
  country: (v) => `Country: ${v}`,
  category: (v) => `Category: ${v}`,
  paymentMethod: (v) => `Payment: ${v}`,
  generation: (v) => `Generation: ${v}`,
  month: (v) => `Month: ${v}`,
  year: (v) => `Year: ${v}`,
  search: (v) => `Transaction ID contains "${v}"`,
};

type SortKey = keyof IntlRecord;

export function IntlDrillDownTable({
  totalRecords,
  filter,
  onFilterChange,
}: {
  totalRecords: number;
  filter: IntlFilter;
  onFilterChange: (filter: IntlFilter) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchInput, setSearchInput] = useState(filter.search ?? "");

  const [prevFilter, setPrevFilter] = useState(filter);
  if (filter !== prevFilter) {
    setPrevFilter(filter);
    setSearchInput(filter.search ?? "");
    setPageIndex(0);
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== (filter.search ?? "")) {
        onFilterChange({ ...filter, search: searchInput || undefined });
        setPageIndex(0);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { rows, total, loading } = useIntlRecords(filter, pageIndex, PAGE_SIZE, sortBy, sortDir);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
    setPageIndex(0);
  }

  function removeFilterKey(key: keyof IntlFilter) {
    const next = { ...filter };
    delete next[key];
    onFilterChange(next);
    if (key === "search") setSearchInput("");
  }

  function exportCsv() {
    const url = exportIntlRecordsUrl(filter);
    const a = document.createElement("a");
    a.href = url;
    a.click();
  }

  const activeFilterEntries = Object.entries(filter).filter(([, v]) => v !== undefined);

  const columns: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "transactionId", label: "Transaction" },
    { key: "date", label: "Date" },
    { key: "country", label: "Country" },
    { key: "category", label: "Category" },
    { key: "generation", label: "Generation" },
    { key: "paymentMethod", label: "Payment" },
    { key: "unitPrice", label: "Unit Price", align: "right" },
    { key: "quantity", label: "Qty", align: "right" },
    { key: "revenue", label: "Revenue", align: "right" },
  ];

  return (
    <Card
      title="Drill-down Table"
      subtitle={`${formatNumber(total)} of ${formatNumber(totalRecords)} records match current filters · served live from FastAPI + SQLite`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search Transaction ID…"
          className="text-xs rounded-md border border-[var(--card-border)] bg-transparent px-2.5 py-1.5 text-[var(--foreground)] placeholder:text-[var(--chart-muted)] focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
        />
        {activeFilterEntries.map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium px-2.5 py-1"
          >
            {FILTER_LABELS[key]?.(value) ?? `${key}: ${String(value)}`}
            <button
              type="button"
              onClick={() => removeFilterKey(key as keyof IntlFilter)}
              className="hover:text-blue-800 dark:hover:text-blue-200"
              aria-label={`Remove ${key} filter`}
            >
              ×
            </button>
          </span>
        ))}
        {activeFilterEntries.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onFilterChange({});
              setSearchInput("");
            }}
            className="text-[11px] text-[var(--chart-muted)] hover:text-[var(--foreground)] underline"
          >
            Clear all
          </button>
        )}
        <button
          type="button"
          onClick={exportCsv}
          disabled={total === 0}
          className="ml-auto text-xs font-medium rounded-md border border-[var(--card-border)] px-2.5 py-1.5 text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40 disabled:opacity-40"
        >
          Export CSV ({formatNumber(total)} rows)
        </button>
      </div>

      <div className="overflow-x-auto -mx-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--card-border)] text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={`px-4 py-2 font-medium text-[var(--chart-muted)] cursor-pointer select-none whitespace-nowrap hover:text-[var(--foreground)] ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                  {sortBy === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--chart-muted)]">
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr
                  key={r.transactionId}
                  className="border-b border-[var(--card-border)]/60 hover:bg-[var(--chart-gridline)]/30"
                >
                  <td className="px-4 py-2 whitespace-nowrap">{r.transactionId}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="px-4 py-2">{r.country}</td>
                  <td className="px-4 py-2">{r.category}</td>
                  <td className="px-4 py-2">{r.generation}</td>
                  <td className="px-4 py-2">{r.paymentMethod}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatUSD(r.unitPrice)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.quantity}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatUSD(r.revenue)}</td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--chart-muted)]">
                  No records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-[var(--chart-muted)]">
        <span>
          Page {total === 0 ? 0 : pageIndex + 1} of {totalPages}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
            className="rounded-md border border-[var(--card-border)] px-2.5 py-1 disabled:opacity-40 hover:bg-[var(--chart-gridline)]/40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageIndex >= totalPages - 1}
            className="rounded-md border border-[var(--card-border)] px-2.5 py-1 disabled:opacity-40 hover:bg-[var(--chart-gridline)]/40"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
}
