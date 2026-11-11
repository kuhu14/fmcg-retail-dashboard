import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
page.on("request", (req) => {
  if (req.url().includes("/api/summary")) console.log("[req]", req.url());
});

await page.goto("http://localhost:3001/", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2000);

await page.getByRole("button", { name: "Supply Chain", exact: true }).first().click();
await page.waitForTimeout(1500);

const recordsLine = () => page.locator("text=/matching transactions/").first().innerText();
console.log("baseline:", await recordsLine());

// Click "At risk" first
await page.getByRole("button", { name: /At risk/ }).first().click();
await page.waitForTimeout(3000);
console.log("after At risk:", await recordsLine());

// Now click "Overstocked" -- should fully replace, not stack
await page.getByRole("button", { name: /Overstocked/ }).first().click();
await page.waitForTimeout(3000);
console.log("after Overstocked:", await recordsLine());

// Now click "Healthy" -- this is what the user said doesn't work
await page.getByRole("button", { name: /^Healthy/ }).first().click();
await page.waitForTimeout(3000);
console.log("after Healthy:", await recordsLine());
await page.screenshot({ path: "healthy-click.png" });

// double-click Healthy again quickly to clear
await page.getByRole("button", { name: /^Healthy/ }).first().click();
await page.waitForTimeout(100);
await page.getByRole("button", { name: /^Healthy/ }).first().click();
await page.waitForTimeout(3000);
console.log("after double-click Healthy (should clear):", await recordsLine());

await browser.close();
