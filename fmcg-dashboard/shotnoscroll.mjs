import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);

const cityCard = page.locator("text=Revenue by city").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
await cityCard.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
const scrollBefore = await page.evaluate(() => window.scrollY);

const firstBar = cityCard.locator(".recharts-rectangle").first();
await firstBar.click();
await page.waitForTimeout(300);
const scrollAfterClick = await page.evaluate(() => window.scrollY);

async function filterText() {
  const el = page.locator("text=Focused on:");
  if ((await el.count()) === 0) return "(none)";
  return page.locator("text=Focused on:").locator("xpath=..").innerText();
}
console.log("AFTER CLICK 1:", await filterText());

// Natural double-click, no scroll in between since we never moved
await firstBar.dblclick();
await page.waitForTimeout(300);
const scrollAfterDbl = await page.evaluate(() => window.scrollY);
console.log("AFTER DBLCLICK:", await filterText());

console.log(JSON.stringify({ scrollBefore, scrollAfterClick, scrollAfterDbl }));

await browser.close();
