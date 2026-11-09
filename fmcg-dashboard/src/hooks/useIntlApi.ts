"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { IntlFilter, IntlRecord, IntlRecordsResponse, IntlSummary } from "@/lib/types";

function filterToParams(filter: IntlFilter): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filter.country) params.country = filter.country;
  if (filter.category) params.category = filter.category;
  if (filter.paymentMethod) params.paymentMethod = filter.paymentMethod;
  if (filter.generation) params.generation = filter.generation;
  if (filter.month) params.month = filter.month;
  if (filter.year !== undefined) params.year = filter.year;
  if (filter.search) params.search = filter.search;
  return params;
}

function summaryParams(filter: IntlFilter) {
  const rest = { ...filter };
  delete rest.search;
  return filterToParams(rest);
}

export function useIntlSummary(filter: IntlFilter = {}) {
  const [summary, setSummary] = useState<IntlSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    api
      .get<IntlSummary>("/api/intl/summary", { params: summaryParams(filter), signal: controller.signal })
      .then((res) => {
        if (!cancelled) setSummary(res.data);
      })
      .catch((err) => {
        if (!cancelled && err.name !== "CanceledError") {
          setError(err.message ?? "Failed to load international summary");
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)]);

  return { summary, loading: !summary && !error, error };
}

export function useIntlRecords(
  filter: IntlFilter,
  page: number,
  pageSize: number,
  sortBy: keyof IntlRecord,
  sortDir: "asc" | "desc"
) {
  const [data, setData] = useState<IntlRecordsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    api
      .get<IntlRecordsResponse>("/api/intl/records", {
        params: { ...filterToParams(filter), page, pageSize, sortBy, sortDir },
        signal: controller.signal,
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled && err.name !== "CanceledError") {
          setError(err.message ?? "Failed to load international records");
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

export function exportIntlRecordsUrl(filter: IntlFilter): string {
  const params = new URLSearchParams();
  Object.entries(filterToParams(filter)).forEach(([k, v]) => params.set(k, String(v)));
  return `${api.defaults.baseURL}/api/intl/records/export?${params.toString()}`;
}
