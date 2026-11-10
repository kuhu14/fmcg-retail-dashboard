import { chromium } from "playwright";

const browser = await chromium.launch();

for (const width of [1152, 1100, 1024]) {
  const page = await browser.newPage({ viewport: { width, height: 500 } });
  await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `filters-b-${width}.png` });
  await page.close();
}

await browser.close();
