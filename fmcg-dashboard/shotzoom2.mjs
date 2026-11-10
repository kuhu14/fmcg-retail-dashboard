import { chromium } from "playwright";

const browser = await chromium.launch();

for (const base of [1366, 1280, 1228]) {
  const page = await browser.newPage({ viewport: { width: base, height: 500 } });
  await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(800);
  for (const zoom of [1, 0.9, 0.8]) {
    await page.evaluate((z) => { document.body.style.zoom = String(z); }, zoom);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `b${base}-z${zoom}.png` });
  }
  await page.close();
}

await browser.close();
