export type Trend = "up" | "down" | "flat";

/** Compares a metric's latest month against the one before it. Null when
 * there aren't at least two months in the (possibly filtered) data to compare.
 * Generic over any monthly-breakdown row shape (FMCG's Summary or the
 * International department's IntlSummary both qualify). */
export function monthlyTrendDirection<T extends Record<string, unknown>>(
  monthlyTrend: T[],
  key: keyof T
): Trend | null {
  if (monthlyTrend.length < 2) return null;
  const latest = monthlyTrend[monthlyTrend.length - 1][key] as number;
  const previous = monthlyTrend[monthlyTrend.length - 2][key] as number;
  if (latest > previous) return "up";
  if (latest < previous) return "down";
  return "flat";
}
