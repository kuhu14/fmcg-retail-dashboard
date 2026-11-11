import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

page.on("response", async (res) => {
  if (res.url().includes("/api/summary")) {
    console.log("RESPONSE", res.status(), res.url());
  }
});

await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);

await page.getByRole("button", { name: "Customer & Marketing", exact: true }).click();
await page.waitForTimeout(1500);

async function loyaltyLegend() {
  return page.locator("text=Loyalty mix").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]").locator("ul").innerText();
}

console.log("BEFORE FILTER — Loyalty mix legend:\n", await loyaltyLegend());

const genderCard = page.locator("text=Revenue by gender").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
const femaleLegendBtn = genderCard.locator("li button").first();
console.log("clicking button with text:", await femaleLegendBtn.innerText());
await femaleLegendBtn.click();
await page.waitForTimeout(1500);

const chipCount = await page.locator("text=Focused on:").count();
console.log("filter chip present:", chipCount > 0);
if (chipCount > 0) console.log("chip:", await page.locator("text=Focused on:").locator("xpath=..").innerText());

console.log("AFTER Gender=F — Loyalty mix legend:\n", await loyaltyLegend());
console.log("AFTER Gender=F — Revenue by gender legend:\n", await page.locator("text=Revenue by gender").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]").locator("ul").innerText());

await browser.close();
