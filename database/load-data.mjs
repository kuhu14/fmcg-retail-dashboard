// Loads the FMCG retail CSV into a local SQLite database (fmcg.db) as the
// `sales` table. No external DB server required — file-based SQL database,
// queryable with any standard SQL client or a backend (e.g. FastAPI + SQLAlchemy).
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(
  __dirname,
  "..",
  "Indian FMCG Retail Sales  Customer  Inventory (2024).csv"
);
const DB_PATH = path.resolve(__dirname, "fmcg.db");

if (fs.existsSync(DB_PATH)) fs.rmSync(DB_PATH);
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE sales (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id      INTEGER NOT NULL,
    invoice_date    TEXT NOT NULL,
    city            TEXT NOT NULL,
    store_format    TEXT NOT NULL,
    category        TEXT NOT NULL,
    brand           TEXT NOT NULL,
    channel         TEXT NOT NULL,
    payment_mode    TEXT NOT NULL,
    units           INTEGER NOT NULL,
    cost_price      REAL NOT NULL,
    selling_price   REAL NOT NULL,
    revenue         REAL NOT NULL,
    cost            REAL NOT NULL,
    margin          REAL NOT NULL,
    margin_pct      REAL NOT NULL,
    stock_on_hand   INTEGER NOT NULL,
    reorder_level   INTEGER NOT NULL,
    lead_time_days  INTEGER NOT NULL,
    customer_age    INTEGER,
    customer_gender TEXT,
    loyalty_flag    INTEGER NOT NULL
  );

  CREATE INDEX idx_sales_city ON sales(city);
  CREATE INDEX idx_sales_category ON sales(category);
  CREATE INDEX idx_sales_channel ON sales(channel);
  CREATE INDEX idx_sales_date ON sales(invoice_date);
  CREATE INDEX idx_sales_invoice_id ON sales(invoice_id);
`);

const insert = db.prepare(`
  INSERT INTO sales (
    invoice_id, invoice_date, city, store_format, category, brand, channel,
    payment_mode, units, cost_price, selling_price, revenue, cost, margin,
    margin_pct, stock_on_hand, reorder_level, lead_time_days, customer_age,
    customer_gender, loyalty_flag
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const rl = readline.createInterface({
  input: fs.createReadStream(CSV_PATH, "utf8"),
  crlfDelay: Infinity,
});

let header = null;
let count = 0;

db.exec("BEGIN TRANSACTION");
for await (const line of rl) {
  if (!header) {
    header = line.split(",");
    continue;
  }
  if (!line.trim()) continue;
  const c = line.split(",");
  const age = c[18] === "" ? null : Number(c[18]);
  insert.run(
    Number(c[0]),
    c[1],
    c[2],
    c[3],
    c[4],
    c[5],
    c[6],
    c[7],
    Number(c[8]),
    Number(c[9]),
    Number(c[10]),
    Number(c[11]),
    Number(c[12]),
    Number(c[13]),
    Number(c[14]),
    Number(c[15]),
    Number(c[16]),
    Number(c[17]),
    age,
    c[19] || null,
    Number(c[20])
  );
  count++;
  if (count % 20000 === 0) {
    db.exec("COMMIT");
    db.exec("BEGIN TRANSACTION");
    console.log(`  ${count.toLocaleString("en-IN")} rows inserted...`);
  }
}
db.exec("COMMIT");

const { total } = db.prepare("SELECT COUNT(*) AS total FROM sales").get();
console.log(`Done. ${total.toLocaleString("en-IN")} rows loaded into ${DB_PATH}`);
db.close();
