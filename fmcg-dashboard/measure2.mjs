import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2600, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1000);

const data = await page.evaluate(() => {
  const groups = document.querySelectorAll(".flex.flex-wrap.items-start")[0].children;
  const timeGroup = Array.from(groups).find((g) => g.querySelector("span")?.textContent === "Time");
  const children = Array.from(timeGroup.querySelector("div.flex.flex-wrap").children);
  return children.map((c) => ({
    tag: c.tagName,
    text: c.textContent?.slice(0, 40),
    width: c.getBoundingClientRect().width,
  }));
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
