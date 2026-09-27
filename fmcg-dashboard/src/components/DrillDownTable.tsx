"use client";

import { useEffect, useState } from "react";
import type { DecodedRecord, RecordFilter } from "@/lib/types";
import { exportRecordsUrl, useRecords } from "@/hooks/useApi";
import { formatDate, formatINR, formatNumber, formatPct } from "@/lib/format";
import { Card } from "./Card";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const FILTER_LABELS: Record<string, (v: unknown) => string> = {
  city: (v) => `City: ${v}`,
  category: (v) => `Category: ${v}`,
  storeFormat: (v) => `Format: ${v}`,
  channel: (v) => `Channel: ${v}`,
  paymentMode: (v) => `Payment: ${v}`,
  brand: (v) => `Brand: ${v}`,
  gender: (v) => `Gender: ${v}`,
  loyalty: (v) => (v === 1 ? "Loyalty: Member" : "Loyalty: Non-member"),
  month: (v) => `Month: ${v}`,
  stockRisk: () => "At/below reorder level",
  overstock: () => "Overstocked (>3x reorder)",
  ageMissing: () => "Age not captured",
  search: (v) => `Invoice ID contains "${v}"`,
};

type SortKey = keyof DecodedRecord;

export function DrillDownTable({
  totalRecords,
  filter,
  onFilterChange,
}: {
  totalRecords: number;
  filter: RecordFilter;
  onFilterChange: (filter: RecordFilter) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchInput, setSearchInput] = useState(filter.search ?? "");

  // Keep the search box in sync when a chart/insight click replaces the
  // filter externally (e.g. clearing a previous search), and reset paging.
  // Adjusting state during render (React's documented pattern for "reset
  // state when a prop changes") rather than in an effect, since it applies
  // before paint with no extra render or setState-in-effect cascade.
  const [prevFilter, setPrevFilter] = useState(filter);
  if (filter !== prevFilter) {
    setPrevFilter(filter);
    setSearchInput(filter.search ?? "");
    setPageIndex(0);
  }

  // Debounce free-text search so we don't fire a request per keystroke.
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

  const { rows, total, loading } = useRecords(filter, pageIndex, PAGE_SIZE, sortBy, sortDir);
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

  function removeFilterKey(key: keyof RecordFilter) {
    const next = { ...filter };
    delete next[key];
    onFilterChange(next);
    if (key === "search") setSearchInput("");
  }

  function exportCsv() {
    const url = exportRecordsUrl(filter);
    const a = document.createElement("a");
    a.href = url;
    a.click();
  }

  const activeFilterEntries = Object.entries(filter).filter(([, v]) => v !== undefined);

  const columns: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "invoiceId", label: "Invoice" },
    { key: "date", label: "Date" },
    { key: "city" as SortKey, label: "City" },
    { key: "category" as SortKey, label: "Category" },
    { key: "brand" as SortKey, label: "Brand" },
    { key: "channel" as SortKey, label: "Channel" },
    { key: "revenue", label: "Revenue", align: "right" },
    { key: "marginPct", label: "Margin %", align: "right" },
    { key: "stockOnHand", label: "Stock", align: "right" },
    { key: "reorderLevel", label: "Reorder Lvl", align: "right" },
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
          placeholder="Search Invoice ID…"
          className="text-xs rounded-md border border-[var(--card-border)] bg-transparent px-2.5 py-1.5 text-[var(--foreground)] placeholder:text-[var(--chart-muted)] focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
        />
        {activeFilterEntries.map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium px-2.5 py-1"
          >
            {FILTER_LABELS[key]?.(value) ?? `${key}: ${String(value)}`}
            <button
              type="button"
              onClick={() => removeFilterKey(key as keyof RecordFilter)}
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
              rows.map((r) => {
                const atRisk = r.stockOnHand <= r.reorderLevel;
                return (
                  <tr
                    key={r.invoiceId}
                    className="border-b border-[var(--card-border)]/60 hover:bg-[var(--chart-gridline)]/30"
                  >
                    <td className="px-4 py-2 tabular-nums">{r.invoiceId}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(r.date)}</td>
                    <td className="px-4 py-2">{r.city}</td>
                    <td className="px-4 py-2">{r.category}</td>
                    <td className="px-4 py-2">{r.brand}</td>
                    <td className="px-4 py-2">{r.channel}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatINR(r.revenue)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatPct(r.marginPct, 1)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.stockOnHand}</td>
                    <td
                      className={`px-4 py-2 text-right tabular-nums ${
                        atRisk ? "text-red-600 dark:text-red-400 font-medium" : ""
                      }`}
                    >
                      {r.reorderLevel}
                    </td>
                  </tr>
                );
              })}
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
