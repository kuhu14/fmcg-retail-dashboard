// Loads the "dirty_transactions_dataset" CSV (global multi-country retail
// transactions, 2024-2026) into fmcg.db as a second table, `intl_sales`,
// powering the International/Exports department. Separate from `sales`
// (the India FMCG table) since the schemas don't overlap.
//
// Cleaning rules (mirrors the methodology in the source PDF report):
//  - country / product_category / payment_method: casing + alias unified
//    (e.g. "nigeria" / "Nigeria" -> "Nigeria", "USA" -> "United States").
//  - unit_price: quoted thousands-separator strings ("1,500") parsed to
//    numbers; missing values filled with the column average.
//  - age: missing values filled with the column average (rounded).
//  - quantity: negative values are a sign error, not a real return (the
//    only negative value seen is -1, immediately next to otherwise-valid
//    1-5 quantities) -> absolute value taken; missing values filled with
//    the rounded column average.
//  - transaction_date: rows missing it are dropped entirely (can't be
//    placed on a timeline).
//  - payment_method: missing values filled with the column's mode (most
//    common valid value) -- the dashboard this mirrors only ever shows
//    Card/Cash/Transfer, no "unknown" bucket.
//  - customer_name / email: dropped. They're personally identifying and
//    unused by any aggregate, chart, or filter in the dashboard.
//  - revenue (new feature) = unit_price * quantity.
//  - generation (new feature) derived from age: Gen Z 18-27, Millennials
//    28-43, Gen X 44-59, Baby Boomers 60+.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, "..", "dirty_transactions_dataset (1).csv");
const DB_PATH = path.resolve(__dirname, "fmcg.db");

const COUNTRY_MAP = {
  nigeria: "Nigeria",
  usa: "United States",
  "united states": "United States",
  "united kingdom": "United Kingdom",
  ghana: "Ghana",
  turkey: "Turkey",
};

const CATEGORY_MAP = {
  electronics: "Electronics",
  fashion: "Fashion",
  groceries: "Groceries",
  home: "Home",
};

const PAYMENT_MAP = {
  card: "Card",
  cash: "Cash",
  transfer: "Transfer",
};

function generationFor(age) {
  if (age >= 60) return "Baby Boomers";
  if (age >= 44) return "Gen X";
  if (age >= 28) return "Millennials";
  return "Gen Z";
}

// Minimal CSV line parser that respects double-quoted fields containing
// commas (e.g. "1,500") -- a plain split(",") would break on those.
function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

const lines = fs.readFileSync(CSV_PATH, "utf8").split(/\r?\n/).filter((l) => l.trim());
const header = parseCsvLine(lines[0]);
const rows = lines.slice(1).map(parseCsvLine);

const col = Object.fromEntries(header.map((name, i) => [name, i]));

function parseNumber(raw) {
  if (raw === undefined || raw === null || raw.trim() === "") return null;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isNaN(n) ? null : n;
}

// Pass 1: parse + normalize everything except the average-fill step, and
// drop rows with no transaction_date.
const parsed = [];
for (const r of rows) {
  const transactionDate = r[col.transaction_date]?.trim();
  if (!transactionDate) continue;

  const countryRaw = r[col.country]?.trim().toLowerCase();
  const categoryRaw = r[col.product_category]?.trim().toLowerCase();
  const paymentRaw = r[col.payment_method]?.trim().toLowerCase();

  parsed.push({
    transactionId: r[col.transaction_id]?.trim(),
    age: parseNumber(r[col.age]),
    country: COUNTRY_MAP[countryRaw] ?? r[col.country]?.trim(),
    category: CATEGORY_MAP[categoryRaw] ?? r[col.product_category]?.trim(),
    unitPrice: parseNumber(r[col.unit_price]),
    quantity: parseNumber(r[col.quantity]),
    transactionDate,
    paymentMethod: PAYMENT_MAP[paymentRaw] || null,
  });
}

// Pass 2: compute averages from valid values only, for fill-in.
const avg = (values) => {
  const valid = values.filter((v) => v !== null && v !== undefined);
  return valid.reduce((s, v) => s + v, 0) / valid.length;
};
const avgAge = Math.round(avg(parsed.map((p) => p.age)));
const avgUnitPrice = avg(parsed.map((p) => p.unitPrice));
const avgQuantity = Math.max(1, Math.round(avg(parsed.map((p) => (p.quantity === null ? null : Math.abs(p.quantity))))));

const paymentCounts = {};
for (const p of parsed) {
  if (p.paymentMethod) paymentCounts[p.paymentMethod] = (paymentCounts[p.paymentMethod] ?? 0) + 1;
}
const modePaymentMethod = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0][0];

for (const p of parsed) {
  if (p.age === null) p.age = avgAge;
  if (p.unitPrice === null) p.unitPrice = avgUnitPrice;
  p.quantity = p.quantity === null ? avgQuantity : Math.abs(p.quantity);
  p.paymentMethod = p.paymentMethod ?? modePaymentMethod;
  p.revenue = Math.round(p.unitPrice * p.quantity * 100) / 100;
  p.generation = generationFor(p.age);
}

const db = new DatabaseSync(DB_PATH);
db.exec("DROP TABLE IF EXISTS intl_sales");
db.exec(`
  CREATE TABLE intl_sales (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id   TEXT NOT NULL,
    transaction_date TEXT NOT NULL,
    country          TEXT NOT NULL,
    category         TEXT NOT NULL,
    payment_method   TEXT NOT NULL,
    age              INTEGER NOT NULL,
    generation       TEXT NOT NULL,
    unit_price       REAL NOT NULL,
    quantity         INTEGER NOT NULL,
    revenue          REAL NOT NULL
  );

  CREATE INDEX idx_intl_country ON intl_sales(country);
  CREATE INDEX idx_intl_category ON intl_sales(category);
  CREATE INDEX idx_intl_date ON intl_sales(transaction_date);
`);

const insert = db.prepare(`
  INSERT INTO intl_sales (
    transaction_id, transaction_date, country, category, payment_method,
    age, generation, unit_price, quantity, revenue
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec("BEGIN TRANSACTION");
for (const p of parsed) {
  insert.run(
    p.transactionId,
    p.transactionDate,
    p.country,
    p.category,
    p.paymentMethod,
    p.age,
    p.generation,
    p.unitPrice,
    p.quantity,
    p.revenue
  );
}
db.exec("COMMIT");

const { total } = db.prepare("SELECT COUNT(*) AS total FROM intl_sales").get();
const { totalRevenue } = db.prepare("SELECT SUM(revenue) AS totalRevenue FROM intl_sales").get();
console.log(`Done. ${total} rows loaded into intl_sales (dropped ${rows.length - parsed.length} rows missing a date).`);
console.log(`Total revenue: $${totalRevenue.toFixed(2)}`);
console.log(`Fill-ins used -> avg age: ${avgAge}, avg unit price: ${avgUnitPrice.toFixed(2)}, avg quantity: ${avgQuantity}, mode payment method: ${modePaymentMethod}`);
db.close();
