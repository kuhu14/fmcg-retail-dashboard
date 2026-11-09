import type { Summary } from "./types";

export type Trend = "up" | "down" | "flat";

type MonthlyRow = Summary["monthlyTrend"][number];

/** Compares a metric's latest month against the one before it. Null when
 * there aren't at least two months in the (possibly filtered) data to compare. */
export function monthlyTrendDirection(
  monthlyTrend: MonthlyRow[],
  key: keyof MonthlyRow
): Trend | null {
  if (monthlyTrend.length < 2) return null;
  const latest = monthlyTrend[monthlyTrend.length - 1][key] as number;
  const previous = monthlyTrend[monthlyTrend.length - 2][key] as number;
  if (latest > previous) return "up";
  if (latest < previous) return "down";
  return "flat";
}
