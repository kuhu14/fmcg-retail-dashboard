"use client";

import type { ReactNode } from "react";
import type { RecordFilter, Summary } from "@/lib/types";
import { monthLabel } from "@/lib/format";
import { TimeRangeToggle } from "./TimeRangeToggle";
import { DATASET_MAX_DATE, DATASET_MIN_DATE, type TimeRangeId } from "@/lib/timeRange";

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--chart-muted)]">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[110px]"
    >
      <option value="">All {label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FilterPanel({
  filter,
  onFieldChange,
  data,
  timeRange,
  onTimeRangeChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: {
  filter: RecordFilter;
  onFieldChange: (key: keyof RecordFilter, value: string) => void;
  data: Summary;
  timeRange: TimeRangeId;
  onTimeRangeChange: (id: TimeRangeId) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--chart-surface)] p-3">
      <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
        <FilterGroup label="Geography">
          <FilterSelect
            label="Cities"
            value={filter.city ?? ""}
            onChange={(v) => onFieldChange("city", v)}
            options={data.byCity.map((c) => ({ value: c.city, label: c.city }))}
          />
        </FilterGroup>

        <FilterGroup label="Category">
          <FilterSelect
            label="Categories"
            value={filter.category ?? ""}
            onChange={(v) => onFieldChange("category", v)}
            options={data.byCategory.map((c) => ({ value: c.category, label: c.category }))}
          />
          <FilterSelect
            label="Brands"
            value={filter.brand ?? ""}
            onChange={(v) => onFieldChange("brand", v)}
            options={data.byBrand.map((b) => ({ value: b.brand, label: b.brand }))}
          />
        </FilterGroup>

        <FilterGroup label="Channel & Format">
          <FilterSelect
            label="Channels"
            value={filter.channel ?? ""}
            onChange={(v) => onFieldChange("channel", v)}
            options={data.byChannel.map((c) => ({ value: c.channel, label: c.channel }))}
          />
          <FilterSelect
            label="Formats"
            value={filter.storeFormat ?? ""}
            onChange={(v) => onFieldChange("storeFormat", v)}
            options={data.byStoreFormat.map((s) => ({ value: s.storeFormat, label: s.storeFormat }))}
          />
        </FilterGroup>
      </div>

      <div className="flex flex-wrap items-start gap-x-5 gap-y-3 pt-3 border-t border-[var(--card-border)]">
        <FilterGroup label="Time">
          <TimeRangeToggle value={timeRange} onChange={onTimeRangeChange} />
          {timeRange === "custom" ? (
            <>
              <input
                type="date"
                aria-label="From date"
                value={customFrom}
                min={DATASET_MIN_DATE}
                max={customTo || DATASET_MAX_DATE}
                onChange={(e) => onCustomFromChange(e.target.value)}
                className="text-xs rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-[var(--chart-muted)]">to</span>
              <input
                type="date"
                aria-label="To date"
                value={customTo}
                min={customFrom || DATASET_MIN_DATE}
                max={DATASET_MAX_DATE}
                onChange={(e) => onCustomToChange(e.target.value)}
                className="text-xs rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </>
          ) : (
            <FilterSelect
              label="Months"
              value={filter.month ?? ""}
              onChange={(v) => onFieldChange("month", v)}
              options={data.monthlyTrend.map((m) => ({ value: m.month, label: monthLabel(m.month) }))}
            />
          )}
        </FilterGroup>

        <FilterGroup label="Customer">
          <FilterSelect
            label="Payment"
            value={filter.paymentMode ?? ""}
            onChange={(v) => onFieldChange("paymentMode", v)}
            options={data.byPaymentMode.map((p) => ({ value: p.paymentMode, label: p.paymentMode }))}
          />
          <FilterSelect
            label="Genders"
            value={filter.gender ?? ""}
            onChange={(v) => onFieldChange("gender", v)}
            options={data.byGender.map((g) => ({ value: g.gender, label: g.gender }))}
          />
          <FilterSelect
            label="Loyalty"
            value={filter.loyalty === undefined ? "" : String(filter.loyalty)}
            onChange={(v) => onFieldChange("loyalty", v)}
            options={[
              { value: "1", label: "Member" },
              { value: "0", label: "Non-member" },
            ]}
          />
        </FilterGroup>
      </div>
    </div>
  );
}
