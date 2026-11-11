import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1500);

await page.getByRole("button", { name: "Customer & Marketing", exact: true }).click();
await page.waitForTimeout(1500);

async function loyaltyLegend() {
  return page.locator("text=Loyalty mix").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]").locator("ul").innerText();
}

console.log("BEFORE — Loyalty mix:\n", await loyaltyLegend());
await page.screenshot({ path: "before-gender-filter.png" });

const genderCard = page.locator("text=Revenue by gender").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
const femaleLegendBtn = genderCard.locator("li button").first();
await femaleLegendBtn.click();
await page.waitForTimeout(1500);

console.log("AFTER Gender=F — Loyalty mix:\n", await loyaltyLegend());
await page.screenshot({ path: "after-gender-filter.png" });

await browser.close();
