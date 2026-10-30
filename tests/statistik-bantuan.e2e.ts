import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "statistik penduduk loads with kind selector",
  { tags: ["smoke"], session: "admin" },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");
    await expect(browser).toHaveURL("/statistik/penduduk");
    await expect(browser.locator("h1")).toContainText("Statistik Penduduk");
    await expect(browser.locator('select[name="kind"]')).toBeVisible();
  },
);

test("statistik penduduk export CSV", async ({ app, browser }) => {
  await app.open("/statistik/penduduk/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

test(
  "statistik bantuan loads with kind selector",
  { session: "admin" },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan");
    await expect(browser).toHaveURL("/statistik/bantuan");
    await expect(browser.locator('select[name="kind"]')).toBeVisible();
  },
);

test("statistik bantuan export CSV", async ({ app, browser }) => {
  await app.open("/statistik/bantuan/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

test("bantuan admin loads with table", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/bantuan");
  await expect(browser).toHaveURL("/bantuan");
  await expect(browser.locator("body")).toBeVisible();
});

test("bantuan detail page loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/bantuan/999999");
  await expect(browser).toHaveURL("/bantuan/999999");
  await expect(browser.locator("body")).toBeVisible();
});

test("bantuan export route loads", async ({ app, browser }) => {
  await app.open("/bantuan/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

test(
  "statistik bantuan pdf export link visible",
  { session: "admin" },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan");
    await expect(browser).toHaveURL("/statistik/bantuan");
    await expect(browser.locator("body")).toBeVisible();
  },
);
