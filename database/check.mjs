import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("./fmcg.db");
console.log("Row count:", db.prepare("SELECT COUNT(*) c FROM sales").get().c);
console.log("Total revenue:", db.prepare("SELECT ROUND(SUM(revenue),2) r FROM sales").get().r);
console.log("Sample row:", JSON.stringify(db.prepare("SELECT * FROM sales LIMIT 1").get()));
console.log("Stockout risk count:", db.prepare("SELECT COUNT(*) c FROM sales WHERE stock_on_hand <= reorder_level").get().c);
console.log("Tables:", db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
db.close();
