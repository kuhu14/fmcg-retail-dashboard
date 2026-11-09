// Generates SIMULATED 2025 and 2026 FMCG rows, derived from the real 2024
// data (database/load-data.mjs), so "Last Year"/"Present Year" have
// something non-empty to show. This is explicitly fabricated data, not a
// second real dataset -- every row keeps its original 2024 price point and
// margin (selling_price/cost_price/margin_pct are copied as-is, since those
// are what make a row's economics realistic), while units sold and stock
// levels get a modest year-over-year growth trend plus random jitter, and
// invoice_date/invoice_id are shifted into a disjoint, non-colliding range
// per year. Run after load-data.mjs, before the backend reads fmcg.db.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "fmcg.db");

// id ranges disjoint from the real data's ~10M-99M 8-digit invoice_ids.
const YEAR_PLANS = [
  { year: 2025, idBase: 100_000_000, growth: 1.05 },
  { year: 2026, idBase: 200_000_000, growth: 1.08 },
];

function jitter(center, spread) {
  return center + (Math.random() * 2 - 1) * spread;
}

const db = new DatabaseSync(DB_PATH);

// Idempotent: drop any previously-generated dummy years before regenerating,
// so re-running this script doesn't pile up duplicates.
db.exec(
  `DELETE FROM sales WHERE substr(invoice_date, 1, 4) IN ('2025', '2026')`
);

const baseRows = db.prepare(`SELECT * FROM sales WHERE substr(invoice_date, 1, 4) = '2024'`).all();
console.log(`Base (real 2024) rows: ${baseRows.length}`);

const insert = db.prepare(`
  INSERT INTO sales (
    invoice_id, invoice_date, city, store_format, category, brand, channel,
    payment_mode, units, cost_price, selling_price, revenue, cost, margin,
    margin_pct, stock_on_hand, reorder_level, lead_time_days, customer_age,
    customer_gender, loyalty_flag
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const { year, idBase, growth } of YEAR_PLANS) {
  db.exec("BEGIN TRANSACTION");
  let count = 0;
  for (const row of baseRows) {
    const [datePart, timePart] = row.invoice_date.split(" ");
    let [, month, day] = datePart.split("-");
    if (month === "02" && day === "29") day = "28"; // 2025/2026 aren't leap years
    const newDate = `${year}-${month}-${day} ${timePart}`;

    const unitsGrowth = growth * jitter(1, 0.15); // +/-15% noise around the trend
    const newUnits = Math.max(1, Math.round(row.units * unitsGrowth));
    const newRevenue = Math.round(newUnits * row.selling_price * 100) / 100;
    const newCost = Math.round(newUnits * row.cost_price * 100) / 100;
    const newMargin = Math.round((newRevenue - newCost) * 100) / 100;
    // margin_pct is price-driven (sellingPrice vs costPrice), not units-driven,
    // so it's unchanged by the quantity jitter -- carried over as-is.
    const newStock = Math.max(0, Math.round(row.stock_on_hand * jitter(1, 0.2)));
    const newLeadTime = Math.max(1, row.lead_time_days + Math.round(jitter(0, 2)));

    insert.run(
      idBase + count,
      newDate,
      row.city,
      row.store_format,
      row.category,
      row.brand,
      row.channel,
      row.payment_mode,
      newUnits,
      row.cost_price,
      row.selling_price,
      newRevenue,
      newCost,
      newMargin,
      row.margin_pct,
      newStock,
      row.reorder_level,
      newLeadTime,
      row.customer_age,
      row.customer_gender,
      row.loyalty_flag
    );
    count++;
    if (count % 20000 === 0) {
      db.exec("COMMIT");
      db.exec("BEGIN TRANSACTION");
    }
  }
  db.exec("COMMIT");
  console.log(`${year}: inserted ${count} simulated rows (growth factor ~${growth}x on 2024 demand).`);
}

const totals = db.prepare(
  `SELECT substr(invoice_date,1,4) AS year, COUNT(*) AS c, SUM(revenue) AS rev FROM sales GROUP BY year ORDER BY year`
).all();
console.log("Per-year totals now in sales table:");
for (const t of totals) console.log(`  ${t.year}: ${t.c} rows, revenue ${t.rev.toFixed(2)}`);

db.close();
