export type DepartmentId =
  | "overview"
  | "finance"
  | "sales"
  | "supply-chain"
  | "customer"
  | "hr"
  | "exports";

export interface Department {
  id: DepartmentId;
  label: string;
  description: string;
  /** Insight ids relevant to this department; omitted = show all (overview only). */
  insightIds?: string[];
  comingSoon?: boolean;
}

export const DEPARTMENTS: Department[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Everything, across every department",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Revenue, cost, margin & payment mix",
    insightIds: ["margin-consistency", "seasonality"],
  },
  {
    id: "sales",
    label: "Sales & Channel",
    description: "Cities, categories, brands & channels",
    insightIds: ["city-balance", "seasonality"],
  },
  {
    id: "supply-chain",
    label: "Supply Chain",
    description: "Stock levels, reorder & overstock risk",
    insightIds: ["stockout-risk", "overstock"],
  },
  {
    id: "customer",
    label: "Customer & Marketing",
    description: "Loyalty, gender & age segments",
    insightIds: ["loyalty-penetration", "data-quality-age"],
  },
  {
    id: "hr",
    label: "HR",
    description: "Workforce attrition analytics & an AI hiring/promotion assistant",
  },
  {
    id: "exports",
    label: "International / Exports",
    description: "Global transactions by country, 2024–2026",
  },
];
