import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "permohonan surat admin loads",
  { tags: ["smoke"], session: "admin" },
  async ({ app, browser }) => {
    await app.open("/permohonan-surat");
    await expect(browser).toHaveURL("/permohonan-surat");
    await expect(browser.locator("body")).toBeVisible();
  },
);

test("persuratan admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/persuratan");
  await expect(browser).toHaveURL("/persuratan");
  await expect(browser.locator("body")).toBeVisible();
});

test("konten dokumen admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/konten/dokumen");
  await expect(browser).toHaveURL("/konten/dokumen");
  await expect(browser.locator("body")).toBeVisible();
});

test("konten menu admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/konten/menu");
  await expect(browser).toHaveURL("/konten/menu");
  await expect(browser.locator("body")).toBeVisible();
});

test("konten widget admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/konten/widget");
  await expect(browser).toHaveURL("/konten/widget");
  await expect(browser.locator("body")).toBeVisible();
});

test("konten slider admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/konten/slider");
  await expect(browser).toHaveURL("/konten/slider");
  await expect(browser.locator("body")).toBeVisible();
});
