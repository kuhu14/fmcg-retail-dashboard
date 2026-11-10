import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

await page.goto("http://localhost:3001", { waitUntil: "networkidle", timeout: 60000 });

await page.getByText("HR", { exact: true }).click();
await page.waitForTimeout(500);

await page.getByText("Hiring Assistant", { exact: true }).click();
await page.waitForTimeout(500);

const prompts = [
  "Who should we hire for the Store Operations Manager role, and why?",
  "Is anyone ready for promotion in Supply Chain?",
  "Which internal employee is the strongest promotion candidate right now?",
  "Compare the two Trade Marketing Lead candidates.",
];

for (const p of prompts) {
  await page.getByRole("button", { name: p }).click();
  await page.waitForTimeout(900);
}

await page.screenshot({ path: "hr-assistant-fixed.png", fullPage: true });

const text = await page.evaluate(() => document.body.innerText);
console.log("---PAGE TEXT START---");
console.log(text);
console.log("---PAGE TEXT END---");

await browser.close();
