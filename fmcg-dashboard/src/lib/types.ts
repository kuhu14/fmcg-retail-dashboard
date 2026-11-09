export interface DimensionAgg {
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
  units: number;
  orders: number;
}

export interface Summary {
  meta: {
    recordCount: number;
    generatedAt: string | null;
    columns: string[];
  };
  totals: {
    revenue: number;
    cost: number;
    margin: number;
    marginPct: number;
    units: number;
    orders: number;
    avgOrderValue: number;
    loyaltyCount: number;
    loyaltyPct: number;
    ageMissing: number;
    ageMissingPct: number;
  };
  byCity: (DimensionAgg & { city: string })[];
  byCategory: (DimensionAgg & { category: string })[];
  byChannel: (DimensionAgg & { channel: string })[];
  byPaymentMode: (DimensionAgg & { paymentMode: string })[];
  byStoreFormat: (DimensionAgg & { storeFormat: string })[];
  byBrand: (DimensionAgg & { brand: string })[];
  byGender: (DimensionAgg & { gender: string })[];
  monthlyTrend: {
    month: string;
    revenue: number;
    cost: number;
    margin: number;
    marginPct: number;
    units: number;
    orders: number;
    avgOrderValue: number;
    loyaltyPct: number;
    stockoutRisk: number;
    stockoutRiskPct: number;
    criticalStock: number;
    overstock: number;
    overstockPct: number;
    avgLeadTimeDays: number;
    avgOrderValueLoyal: number;
    avgOrderValueNonLoyal: number;
    ageMissing: number;
    ageMissingPct: number;
  }[];
  ageBuckets: Record<string, number>;
  byLoyalty: {
    loyalty: number;
    revenue: number;
    orders: number;
    units: number;
    avgOrderValue: number;
    marginPct: number;
  }[];
  inventory: {
    stockoutRisk: number;
    stockoutRiskPct: number;
    criticalStock: number;
    overstock: number;
    overstockPct: number;
    avgLeadTimeDays: number;
    avgStockOnHand: number;
    avgReorderLevel: number;
    leadTimeByCategory: { category: string; avgLeadTimeDays: number }[];
    byCategory: { category: string; atRiskOrders: number }[];
    byCity: { city: string; atRiskOrders: number }[];
  };
  insights: Insight[];
}

export interface Insight {
  id: string;
  severity: "critical" | "warning" | "opportunity" | "info";
  title: string;
  description: string;
  actionLabel: string;
  filter: RecordFilter;
}

export interface RecordFilter {
  city?: string;
  category?: string;
  storeFormat?: string;
  channel?: string;
  paymentMode?: string;
  brand?: string;
  gender?: string;
  loyalty?: number;
  month?: string;
  monthsBack?: number;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  stockRisk?: boolean;
  overstock?: boolean;
  ageMissing?: boolean;
  search?: string;
}

export interface RecordsResponse {
  rows: DecodedRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DecodedRecord {
  invoiceId: number;
  date: string;
  city: string;
  storeFormat: string;
  category: string;
  brand: string;
  channel: string;
  paymentMode: string;
  units: number;
  costPrice: number;
  sellingPrice: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
  stockOnHand: number;
  reorderLevel: number;
  leadTimeDays: number;
  age: number | null;
  gender: string;
  loyalty: number;
}

// --- International/Exports department (global multi-country transactions,
// 2024-2026) -- a separate schema from the India FMCG data above, with no
// city/store/channel/brand/cost/stock concepts, just country-level price ×
// quantity transactions.

export interface IntlDimensionAgg {
  revenue: number;
  units: number;
  orders: number;
}

export interface IntlInsight {
  id: string;
  severity: "critical" | "warning" | "opportunity" | "info";
  title: string;
  description: string;
  actionLabel: string;
  filter: IntlFilter;
}

export interface IntlSummary {
  meta: {
    recordCount: number;
    columns: string[];
  };
  totals: {
    revenue: number;
    units: number;
    orders: number;
    avgOrderValue: number;
  };
  byCountry: (IntlDimensionAgg & { country: string })[];
  byCategory: (IntlDimensionAgg & { category: string })[];
  byPaymentMethod: (IntlDimensionAgg & { paymentMethod: string })[];
  byGeneration: (IntlDimensionAgg & { generation: string })[];
  monthlyTrend: (IntlDimensionAgg & { month: string })[];
  yearlyTrend: (IntlDimensionAgg & { year: string })[];
  insights: IntlInsight[];
}

export interface IntlFilter {
  country?: string;
  category?: string;
  paymentMethod?: string;
  generation?: string;
  month?: string;
  year?: number;
  quarter?: number;
  search?: string;
}

export interface IntlRecord {
  transactionId: string;
  date: string;
  country: string;
  category: string;
  paymentMethod: string;
  age: number;
  generation: string;
  unitPrice: number;
  quantity: number;
  revenue: number;
}

export interface IntlRecordsResponse {
  rows: IntlRecord[];
  total: number;
  page: number;
  pageSize: number;
}
