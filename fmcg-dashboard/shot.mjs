import { chromium } from "playwright";

const [, , outDir] = process.argv;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${outDir}/overview-with-next-event.png` });

await page.getByRole("button", { name: "HR", exact: true }).click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${outDir}/hr-calendar-editable.png` });

// Add a custom event
await page.locator('input[type="date"]').fill("2026-11-20");
await page.getByPlaceholder("e.g. Team offsite").fill("All-hands town hall");
await page.getByRole("button", { name: "Add event", exact: true }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/hr-calendar-after-add.png` });

// Go back to overview to confirm the topline tile updates
await page.getByRole("button", { name: "Overview", exact: true }).click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${outDir}/overview-after-add.png` });

await browser.close();
