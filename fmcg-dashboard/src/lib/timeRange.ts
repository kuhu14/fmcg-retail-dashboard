export type TimeRangeId = "2024" | "12m" | "9m" | "6m" | "3m" | "present" | "custom";

/** The dataset now spans real 2024 data plus simulated 2025/2026 rows --
 * used to bound the custom date pickers. */
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
  /** 2025/2026 aren't real sales -- see generate-dummy-years.mjs. */
  simulated?: boolean;
}

export const TIME_RANGES: TimeRangeOption[] = [
  { id: "2024", label: "2024", monthsBack: null, year: 2024 },
  { id: "12m", label: "Last Year", monthsBack: null, year: 2025, simulated: true },
  { id: "present", label: "Present Year", monthsBack: null, year: 2026, simulated: true },
  { id: "9m", label: "9 Months", monthsBack: 9 },
  { id: "6m", label: "6 Months", monthsBack: 6 },
  { id: "3m", label: "Quarterly", monthsBack: 3 },
  { id: "custom", label: "Custom Range", monthsBack: null },
];
