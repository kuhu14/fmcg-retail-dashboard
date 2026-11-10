import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2600, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);

const data = await page.evaluate(() => {
  const row = document.querySelector('[data-filter-row]') || document.querySelectorAll(".flex.flex-wrap.items-start")[0];
  const groups = Array.from(row.children);
  return {
    rowWidth: row.getBoundingClientRect().width,
    groups: groups.map((g) => ({
      text: g.querySelector("span")?.textContent,
      width: g.getBoundingClientRect().width,
    })),
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
