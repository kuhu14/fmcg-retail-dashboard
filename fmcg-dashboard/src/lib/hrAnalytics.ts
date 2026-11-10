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
