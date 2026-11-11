import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (msg) => console.log("CONSOLE:", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));
page.on("requestfailed", (req) => console.log("REQFAILED:", req.url(), req.failure()?.errorText));

const resp = await page.goto("http://localhost:3001", { waitUntil: "load", timeout: 60000 });
console.log("goto status:", resp?.status());
await page.waitForTimeout(2000);
await page.screenshot({ path: "probe.png", fullPage: true });
console.log("body text sample:", (await page.evaluate(() => document.body.innerText)).slice(0, 500));

await browser.close();
