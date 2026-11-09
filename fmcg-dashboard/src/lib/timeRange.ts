export type TimeRangeId = "12m" | "9m" | "6m" | "3m";

export interface TimeRangeOption {
  id: TimeRangeId;
  label: string;
  /** Months to look back from the dataset's own latest month, or null for
   * the full year (the dataset only spans one calendar year, so that's the
   * natural ceiling -- "Last Year" just means "don't restrict"). */
  monthsBack: number | null;
}

export const TIME_RANGES: TimeRangeOption[] = [
  { id: "12m", label: "Last Year", monthsBack: null },
  { id: "9m", label: "9 Months", monthsBack: 9 },
  { id: "6m", label: "6 Months", monthsBack: 6 },
  { id: "3m", label: "Quarterly", monthsBack: 3 },
];
