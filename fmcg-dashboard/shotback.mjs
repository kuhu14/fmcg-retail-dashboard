import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 400 } });

await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: "header-overview.png" });

for (const dept of ["Finance", "HR", "International / Exports"]) {
  await page.getByRole("button", { name: dept, exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `header-${dept.replace(/[^a-z]/gi, "")}.png` });
}

// Click the new header button specifically (by its title attr) to confirm it navigates back
await page.locator('button[title="Back to Overview"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: "header-back-to-overview.png" });

await browser.close();
