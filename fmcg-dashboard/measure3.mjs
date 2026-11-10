import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2600, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);

const data = await page.evaluate(() => {
  const groups = document.querySelectorAll(".flex.flex-wrap.items-start")[0].children;
  const out = {};
  for (const name of ["Customer", "Category", "Channel & Format"]) {
    const g = Array.from(groups).find((x) => x.querySelector("span")?.textContent === name);
    const children = Array.from(g.querySelector("div.flex.flex-wrap").children);
    out[name] = children.map((c) => ({ text: c.textContent?.slice(0, 20), width: c.getBoundingClientRect().width }));
  }
  return out;
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
