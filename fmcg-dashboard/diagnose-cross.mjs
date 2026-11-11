import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);

await page.getByRole("button", { name: "Customer & Marketing", exact: true }).click();
await page.waitForTimeout(1500);

async function loyaltyLegend() {
  return page.locator("text=Loyalty mix").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]").locator("ul").innerText();
}

console.log("BEFORE FILTER — Loyalty mix legend:\n", await loyaltyLegend());

const genderCard = page.locator("text=Revenue by gender").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
const femaleLegendBtn = genderCard.locator("button", { hasText: "F" }).first();
await femaleLegendBtn.click();
await page.waitForTimeout(800);

console.log("AFTER Gender=F — Loyalty mix legend:\n", await loyaltyLegend());

await browser.close();
