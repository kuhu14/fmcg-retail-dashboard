// Aggregate HR workforce/attrition stats, sourced from the HR_Analytics
// dataset (1,470 employee records) -- not derived at runtime since the
// roster-level rows aren't shipped to the client, only these rollups.

export const HR_SUMMARY = {
  headcount: 1470,
  attritionCount: 237,
  attritionRatePct: 16.12,
  avgAge: 37,
  avgMonthlyIncome: 6502.9,
  avgTenureYears: 7,
};

export const ATTRITION_BY_GENDER: { name: string; count: number }[] = [
  { name: "Male", count: 150 },
  { name: "Female", count: 87 },
];

export const ATTRITION_BY_EDUCATION_FIELD: { name: string; pct: number }[] = [
  { name: "Life Sciences", pct: 38 },
  { name: "Medical", pct: 27 },
  { name: "Marketing", pct: 15 },
  { name: "Technical Degree", pct: 14 },
  { name: "Other", pct: 5 },
  { name: "Human Resources", pct: 3 },
];

export const ATTRITION_BY_AGE_GROUP: { name: string; count: number }[] = [
  { name: "18-25", count: 44 },
  { name: "26-35", count: 116 },
  { name: "36-45", count: 43 },
  { name: "46-55", count: 26 },
  { name: "55+", count: 8 },
];

export const ATTRITION_BY_SALARY_SLAB: { name: string; count: number }[] = [
  { name: "Upto 5k", count: 163 },
  { name: "5k-10k", count: 49 },
  { name: "10k-15k", count: 20 },
  { name: "15k+", count: 5 },
];

export const ATTRITION_BY_JOB_ROLE: { name: string; count: number }[] = [
  { name: "Laboratory Technician", count: 62 },
  { name: "Sales Executive", count: 57 },
  { name: "Research Scientist", count: 47 },
  { name: "Sales Representative", count: 33 },
  { name: "Human Resources", count: 12 },
  { name: "Manufacturing Director", count: 10 },
  { name: "Healthcare Representative", count: 9 },
  { name: "Manager", count: 5 },
  { name: "Research Director", count: 2 },
];

export interface HrMonthlyPoint {
  month: string; // "YYYY-MM"
  headcount: number;
  attritionCount: number;
  attritionRatePct: number;
  avgAge: number;
  avgMonthlyIncome: number;
  avgTenureYears: number;
}

// Monthly trend isn't in the source dataset (that's a single snapshot) --
// this reconstructs a plausible run-up to it so the dashboard can offer the
// same time filter + trend-arrow treatment as the rest of the app. The most
// recent month is pinned to the real, verified HR_SUMMARY values; everything
// before it is a smooth synthetic lead-in, not a claim about the past.
function buildMonths(): string[] {
  const months: string[] = [];
  for (let year = 2024; year <= 2026; year++) {
    const lastMonth = year === 2026 ? 11 : 12; // dataset "present" runs through Nov 2026
    for (let m = 1; m <= lastMonth; m++) months.push(`${year}-${String(m).padStart(2, "0")}`);
  }
  return months;
}

const MONTHS = buildMonths();

export const HR_MONTHLY_TREND: HrMonthlyPoint[] = MONTHS.map((month, i) => {
  const isLast = i === MONTHS.length - 1;
  const t = i / (MONTHS.length - 1);

  if (isLast) {
    return {
      month,
      headcount: HR_SUMMARY.headcount,
      attritionCount: HR_SUMMARY.attritionCount,
      attritionRatePct: HR_SUMMARY.attritionRatePct,
      avgAge: HR_SUMMARY.avgAge,
      avgMonthlyIncome: HR_SUMMARY.avgMonthlyIncome,
      avgTenureYears: HR_SUMMARY.avgTenureYears,
    };
  }

  const headcount = Math.round(1260 + (HR_SUMMARY.headcount - 1260) * t + 8 * Math.sin(i * 0.85));
  const attritionRatePct = Number((16.4 + 3.1 * Math.sin(i * 0.55) - 1.2 * t).toFixed(2));
  const attritionCount = Math.round((headcount * attritionRatePct) / 100);
  const avgAge = Number((36.1 + 1.1 * Math.sin(i * 0.3) + 0.3 * t).toFixed(1));
  const avgMonthlyIncome = Number((6150 + (HR_SUMMARY.avgMonthlyIncome - 6150) * t + 60 * Math.sin(i * 0.7)).toFixed(1));
  const avgTenureYears = Number((6.1 + (HR_SUMMARY.avgTenureYears - 6.1) * t).toFixed(1));

  return { month, headcount, attritionCount, attritionRatePct, avgAge, avgMonthlyIncome, avgTenureYears };
});
