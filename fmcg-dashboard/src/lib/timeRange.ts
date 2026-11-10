export type TimeRangeId = "2024" | "12m" | "9m" | "6m" | "3m" | "present" | "custom";

/** The dataset spans 2024-2026 -- used to bound the custom date pickers. */
export const DATASET_MIN_DATE = "2024-01-01";
export const DATASET_MAX_DATE = "2026-12-31";

export interface TimeRangeOption {
  id: TimeRangeId;
  label: string;
  /** Months to look back from the dataset's own latest month, or null when
   * this option doesn't work that way (full year, or an absolute year). */
  monthsBack: number | null;
  /** When set, filters to this absolute calendar year instead of a lookback
   * window. */
  year?: number;
}

export const TIME_RANGES: TimeRangeOption[] = [
  { id: "2024", label: "2024", monthsBack: null, year: 2024 },
  { id: "12m", label: "2025", monthsBack: null, year: 2025 },
  { id: "present", label: "2026", monthsBack: null, year: 2026 },
  { id: "9m", label: "9mo", monthsBack: 9 },
  { id: "6m", label: "6mo", monthsBack: 6 },
  { id: "3m", label: "Qtr", monthsBack: 3 },
  { id: "custom", label: "Custom", monthsBack: null },
];
