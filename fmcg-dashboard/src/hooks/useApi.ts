"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DecodedRecord, RecordFilter, RecordsResponse, Summary } from "@/lib/types";

export function useSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Summary>("/api/summary")
      .then((res) => {
        if (!cancelled) setSummary(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load summary");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, loading: !summary && !error, error };
}

function filterToParams(filter: RecordFilter): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  if (filter.city) params.city = filter.city;
  if (filter.category) params.category = filter.category;
  if (filter.storeFormat) params.storeFormat = filter.storeFormat;
  if (filter.channel) params.channel = filter.channel;
  if (filter.paymentMode) params.paymentMode = filter.paymentMode;
  if (filter.brand) params.brand = filter.brand;
  if (filter.gender) params.gender = filter.gender;
  if (filter.loyalty !== undefined) params.loyalty = filter.loyalty;
  if (filter.month) params.month = filter.month;
  if (filter.stockRisk) params.stockRisk = true;
  if (filter.overstock) params.overstock = true;
  if (filter.ageMissing) params.ageMissing = true;
  if (filter.search) params.search = filter.search;
  return params;
}

// Note on `loading`: it only reflects the very first fetch. Later refetches
// (filter/page/sort changes) swap `data` in place once the response lands,
// without flashing a loading state in between — SQLite queries here return
// in well under 100ms, so a spinner on every click would just be noise.
export function useRecords(
  filter: RecordFilter,
  page: number,
  pageSize: number,
  sortBy: keyof DecodedRecord,
  sortDir: "asc" | "desc"
) {
  const [data, setData] = useState<RecordsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    api
      .get<RecordsResponse>("/api/records", {
        params: { ...filterToParams(filter), page, pageSize, sortBy, sortDir },
        signal: controller.signal,
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled && err.name !== "CanceledError") {
          setError(err.message ?? "Failed to load records");
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter), page, pageSize, sortBy, sortDir]);

  return {
    rows: data?.rows ?? [],
    total: data?.total ?? 0,
    loading: !data && !error,
    error,
  };
}

export function exportRecordsUrl(filter: RecordFilter): string {
  const params = new URLSearchParams();
  Object.entries(filterToParams(filter)).forEach(([k, v]) => params.set(k, String(v)));
  return `${api.defaults.baseURL}/api/records/export?${params.toString()}`;
}
