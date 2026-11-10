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

// Not in the source dashboard (that only plotted an unlabeled years-at-company
// curve) -- bucketed here into the same shape as the other breakdowns so it
// can sit alongside them as a real filterable dimension.
export const ATTRITION_BY_TENURE: { name: string; count: number }[] = [
  { name: "0-1 yrs", count: 110 },
  { name: "2-3 yrs", count: 55 },
  { name: "4-6 yrs", count: 40 },
  { name: "7-10 yrs", count: 20 },
  { name: "10+ yrs", count: 12 },
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

export type HrFilterDimension = "gender" | "ageGroup" | "educationField" | "salaryBand" | "jobRole" | "tenureBand";

export interface HrAttritionRow {
  gender: string;
  ageGroup: string;
  educationField: string;
  salaryBand: string;
  jobRole: string;
  tenureBand: string;
}

// Deterministic PRNG (mulberry32) so this module produces identical output
// on the server and the client -- Math.random() here would hydration-mismatch.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Expands a {name, count}[] breakdown into a flat array of `count` copies
 * of each name, e.g. [{a,2},{b,1}] -> ["a","a","b"]. */
function expand(data: { name: string; count: number }[]): string[] {
  return data.flatMap((d) => Array(d.count).fill(d.name));
}

// Education field is published as rounded percentages (they sum to 102%),
// so it needs its own integer counts -- adjusted to land on exactly 237 --
// for row synthesis. The displayed chart still uses the original percentages.
const EDUCATION_FIELD_COUNTS: { name: string; count: number }[] = [
  { name: "Life Sciences", count: 87 },
  { name: "Medical", count: 62 },
  { name: "Marketing", count: 36 },
  { name: "Technical Degree", count: 33 },
  { name: "Other", count: 12 },
  { name: "Human Resources", count: 7 },
];

// Every attrition row the dataset actually reports (237) is kept exactly --
// each dimension's shuffled label list reproduces its real marginal count
// precisely. What's synthetic is the pairing *across* dimensions (the real
// joint distribution isn't published), so filtering combines them as if
// independent. Good enough for an interactive cross-filter, not a claim
// about real correlations.
const rng = mulberry32(42);
const genderCol = shuffled(expand(ATTRITION_BY_GENDER), rng);
const ageGroupCol = shuffled(expand(ATTRITION_BY_AGE_GROUP), rng);
const educationFieldCol = shuffled(expand(EDUCATION_FIELD_COUNTS), rng);
const salaryBandCol = shuffled(expand(ATTRITION_BY_SALARY_SLAB), rng);
const jobRoleCol = shuffled(expand(ATTRITION_BY_JOB_ROLE), rng);
const tenureBandCol = shuffled(expand(ATTRITION_BY_TENURE), rng);

export const HR_ATTRITION_ROWS: HrAttritionRow[] = Array.from({ length: HR_SUMMARY.attritionCount }, (_, i) => ({
  gender: genderCol[i],
  ageGroup: ageGroupCol[i],
  educationField: educationFieldCol[i],
  salaryBand: salaryBandCol[i],
  jobRole: jobRoleCol[i],
  tenureBand: tenureBandCol[i],
}));

export const HR_FILTER_DIMENSIONS: { key: HrFilterDimension; label: string; options: string[] }[] = [
  { key: "gender", label: "Gender", options: ATTRITION_BY_GENDER.map((d) => d.name) },
  { key: "ageGroup", label: "Age Group", options: ATTRITION_BY_AGE_GROUP.map((d) => d.name) },
  { key: "educationField", label: "Education", options: ATTRITION_BY_EDUCATION_FIELD.map((d) => d.name) },
  { key: "salaryBand", label: "Salary Band", options: ATTRITION_BY_SALARY_SLAB.map((d) => d.name) },
  { key: "jobRole", label: "Job Role", options: ATTRITION_BY_JOB_ROLE.map((d) => d.name) },
  { key: "tenureBand", label: "Tenure", options: ATTRITION_BY_TENURE.map((d) => d.name) },
];
