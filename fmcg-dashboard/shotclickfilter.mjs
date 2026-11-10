import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1200);

// Scroll down to the Revenue by city chart before clicking, so we can prove
// the click scrolls back to the top.
await page.locator("text=Revenue by city").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const scrollBefore = await page.evaluate(() => window.scrollY);

const cityCard = page.locator("text=Revenue by city").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
const firstBar = cityCard.locator(".recharts-rectangle").first();
await firstBar.click();
await page.waitForTimeout(700); // let the smooth scroll finish

const scrollAfterClick = await page.evaluate(() => window.scrollY);
await page.screenshot({ path: "click-filter-applied.png" });

// Scroll back down and click the SAME bar again fast (within the 400ms window)
await page.locator("text=Revenue by city").scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await firstBar.click();
await page.waitForTimeout(50);
await firstBar.click();
await page.waitForTimeout(700);
const scrollAfterDouble = await page.evaluate(() => window.scrollY);
await page.screenshot({ path: "click-filter-cleared.png" });

console.log(JSON.stringify({ scrollBefore, scrollAfterClick, scrollAfterDouble }));

await browser.close();
