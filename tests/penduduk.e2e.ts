import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "penduduk admin loads with table and search",
  { tags: ["smoke"], session: "admin" },
  async ({ app, browser }) => {
    await app.open("/penduduk");
    await expect(browser).toHaveURL("/penduduk");
    await expect(browser.locator("h1")).toContainText("Penduduk");
    await expect(browser.locator("table")).toBeVisible();
  },
);

test("penduduk filters are present", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk");
  await expect(browser.locator('[name="q"]')).toBeVisible();
  await expect(browser.locator('[name="status"]')).toBeVisible();
  await expect(browser.locator('[name="gender"]')).toBeVisible();
});

test("penduduk export CSV returns content", async ({ app, browser }) => {
  await app.open("/penduduk/ekspor");
  await expect(browser.locator("body")).toContainText("NIK");
});

test("penduduk detail page loads for any id", { session: "admin" }, async ({ app, browser }) => {
  // Halaman detail akan menampilkan NoAccess jika ID tidak valid atau tidak ditemukan.
  await app.open("/penduduk/999999");
  await expect(browser).toHaveURL("/penduduk/999999");
  await expect(browser.locator("body")).toBeVisible();
});

test("penduduk riwayat loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/riwayat");
  await expect(browser).toHaveURL("/penduduk/riwayat");
  await expect(browser.locator("body")).toBeVisible();
});

test("penduduk riwayat export CSV", async ({ app, browser }) => {
  await app.open("/penduduk/riwayat/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

test("kehidupan warga: publik load", async ({ app, browser }) => {
  // Halaman publik harus dapat diakses tanpa login.
  await app.open("/desa/kesehatan/kia");
  await expect(browser).toHaveURL("/desa/kesehatan/kia");
  await expect(browser.locator("body")).toBeVisible();
});
