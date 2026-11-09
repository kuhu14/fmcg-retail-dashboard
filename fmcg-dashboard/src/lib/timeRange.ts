export type TimeRangeId = "12m" | "9m" | "6m" | "3m" | "present" | "custom";

/** The dataset is a fixed snapshot covering exactly this span -- used to
 * bound the custom date pickers so users can't pick a date with no data. */
export const DATASET_MIN_DATE = "2024-01-01";
export const DATASET_MAX_DATE = "2024-12-31";

export interface TimeRangeOption {
  id: TimeRangeId;
  label: string;
  /** Months to look back from the dataset's own latest month, or null when
   * this option doesn't work that way (full year, or an absolute year). */
  monthsBack: number | null;
  /** When set, filters to this absolute calendar year instead of a lookback
   * window -- e.g. "Present Year" means the real current year, which this
   * dataset (a fixed 2024 snapshot) has no rows for, so it's expected to
   * show an empty dashboard rather than silently falling back to 2024. */
  year?: number;
}

export const TIME_RANGES: TimeRangeOption[] = [
  { id: "12m", label: "Last Year", monthsBack: null },
  { id: "9m", label: "9 Months", monthsBack: 9 },
  { id: "6m", label: "6 Months", monthsBack: 6 },
  { id: "3m", label: "Quarterly", monthsBack: 3 },
  { id: "present", label: "Present Year", monthsBack: null, year: new Date().getFullYear() },
  { id: "custom", label: "Custom Range", monthsBack: null },
];
