// The full path: encrypted file from Python → lock screen → unlock → dashboard, with accessibility checks.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const blob = readFileSync("tests/fixtures/sample.enc.json", "utf8");
const PASS = "correct horse battery staple";

async function serve(page: Page, body: string | null) {
  await page.route("**/data/data.enc", (r) => (body ? r.fulfill({ contentType: "application/json", body }) : r.fulfill({ status: 404, body: "" })));
}
async function noA11yViolations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
}

test("no data yet", async ({ page }) => {
  await serve(page, null);
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "No data yet" })).toBeVisible();
});

test("lock screen is accessible and rejects a wrong passphrase", async ({ page }) => {
  await serve(page, blob);
  await page.goto("./");
  const pass = page.getByLabel(/passphrase/i);
  await expect(pass).toBeVisible();
  await noA11yViolations(page);
  await pass.fill("not the right one");
  await page.getByRole("button", { name: /unlock/i }).click();
  await expect(page.getByRole("alert")).not.toBeEmpty();
  await expect(page.getByRole("heading", { name: "Websites" })).toHaveCount(0);
});

test("unlocks and shows the dashboard", async ({ page }) => {
  await serve(page, blob);
  await page.goto("./");
  await page.getByLabel(/passphrase/i).fill(PASS);
  await page.getByRole("button", { name: /unlock/i }).click();
  await expect(page.getByRole("heading", { name: "Websites" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("aksharadhara.netlify.app");
  await expect(page.getByRole("link", { name: /yuktai/ }).first()).toBeVisible();
  await expect(page.getByText("ఈ వారం yuktai")).toBeVisible();
  await noA11yViolations(page);

  // Sorting: click Stars to flip order.
  const firstRepo = () => page.locator("section[aria-labelledby=repos-h] tbody tr").first();
  await expect(firstRepo()).toContainText("yuktai");
  await page.getByRole("button", { name: /^Stars/ }).click();
  await expect(firstRepo()).toContainText("repo-monitor");

  // Lock returns to the passphrase screen.
  await page.getByRole("button", { name: "Lock" }).click();
  await expect(page.getByLabel(/passphrase/i)).toBeVisible();
});

test("remember on this device skips the passphrase next time", async ({ page }) => {
  await serve(page, blob);
  await page.goto("./");
  await page.getByLabel(/passphrase/i).fill(PASS);
  await page.getByLabel(/remember/i).check();
  await page.getByRole("button", { name: /unlock/i }).click();
  await expect(page.getByRole("heading", { name: "Websites" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Websites" })).toBeVisible();
});

test("phone width has no sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await serve(page, blob);
  await page.goto("./");
  await page.getByLabel(/passphrase/i).fill(PASS);
  await page.getByRole("button", { name: /unlock/i }).click();
  await expect(page.getByRole("heading", { name: "Websites" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/phone.png", fullPage: true });
});
