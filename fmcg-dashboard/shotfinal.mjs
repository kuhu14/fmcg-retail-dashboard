import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);

// HR dashboard click + dblclick (instant, client-side, no backend)
await page.getByRole("button", { name: "HR", exact: true }).click();
await page.waitForTimeout(500);
const genderCard = page.locator("text=Attrition by gender").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
const maleBar = genderCard.locator(".recharts-bar-rectangle").first();
await maleBar.scrollIntoViewIfNeeded();
const scrollBeforeHr = await page.evaluate(() => window.scrollY);
// scroll down a bit first to prove scroll-to-top
await page.evaluate(() => window.scrollTo(0, 300));
await page.waitForTimeout(100);
await maleBar.click();
await page.waitForTimeout(400);
const scrollAfterHrClick = await page.evaluate(() => window.scrollY);
await maleBar.dblclick();
await page.waitForTimeout(400);
const hrFilterText = await page.locator("text=Focused on:").count();
console.log(JSON.stringify({ scrollBeforeHr, scrollAfterHrClick, hrFilterChipsAfterDblClick: hrFilterText }));

// International dashboard click-to-filter
await page.getByRole("button", { name: "International / Exports", exact: true }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: "intl-dashboard-check.png", fullPage: true });

await browser.close();
