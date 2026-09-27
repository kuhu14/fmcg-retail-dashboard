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
    margin: number;
    marginPct: number;
    units: number;
    orders: number;
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
