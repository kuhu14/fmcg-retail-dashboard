import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (msg) => console.log("BROWSER:", msg.text()));

await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1200);

const cityCard = page.locator("text=Revenue by city").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
const firstBar = cityCard.locator(".recharts-rectangle").first();

async function filterText() {
  const el = page.locator("text=Focused on:");
  if ((await el.count()) === 0) return "(none)";
  return page.locator("text=Focused on:").locator("xpath=..").innerText();
}

console.log("BEFORE:", await filterText());

await firstBar.click();
await page.waitForTimeout(150);
console.log("AFTER CLICK 1:", await filterText());

await firstBar.dblclick();
await page.waitForTimeout(400);
console.log("AFTER NATIVE DBLCLICK:", await filterText());

await browser.close();
