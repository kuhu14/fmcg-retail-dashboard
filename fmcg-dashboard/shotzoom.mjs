import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);

for (const zoom of [1, 0.9, 0.8, 0.67, 0.5]) {
  await page.evaluate((z) => { document.body.style.zoom = String(z); }, zoom);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `zoom-${zoom}.png` });
}

await browser.close();
