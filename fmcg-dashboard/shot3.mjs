import { chromium } from "playwright";

const browser = await chromium.launch();

for (const width of [1920, 1600, 1440, 1280, 1024]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `filters-${width}.png` });
  await page.close();
}

await browser.close();
