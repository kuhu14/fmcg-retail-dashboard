export const FILTER_LABELS: Record<string, (v: unknown) => string> = {
  city: (v) => `City: ${v}`,
  category: (v) => `Category: ${v}`,
  storeFormat: (v) => `Format: ${v}`,
  channel: (v) => `Channel: ${v}`,
  paymentMode: (v) => `Payment: ${v}`,
  brand: (v) => `Brand: ${v}`,
  gender: (v) => `Gender: ${v}`,
  loyalty: (v) => (v === 1 ? "Loyalty: Member" : "Loyalty: Non-member"),
  month: (v) => `Month: ${v}`,
  stockHealth: (v) =>
    v === "atRisk"
      ? "At/below reorder level"
      : v === "overstocked"
        ? "Overstocked (>3x reorder)"
        : "Healthy stock level",
  ageMissing: () => "Age not captured",
  search: (v) => `Invoice ID contains "${v}"`,
};
