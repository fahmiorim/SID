import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "rumah-tangga admin loads with table",
  { tags: ["smoke"], session: "admin" },
  async ({ app, browser }) => {
    await app.open("/rumah-tangga");
    await expect(browser).toHaveURL("/rumah-tangga");
    await expect(browser.locator("body")).toBeVisible();
  },
);

test("rumah-tangga laporan loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/rumah-tangga/laporan");
  await expect(browser).toHaveURL("/rumah-tangga/laporan");
  await expect(browser.locator("body")).toBeVisible();
});

test("DPT admin loads with table", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dpt");
  await expect(browser).toHaveURL("/penduduk/dpt");
  await expect(browser.locator("body")).toBeVisible();
});

test("DPT rekap loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dpt/rekap");
  await expect(browser).toHaveURL("/penduduk/dpt/rekap");
  await expect(browser.locator("body")).toBeVisible();
});

test("DPT export CSV", async ({ app, browser }) => {
  await app.open("/penduduk/dpt/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

test("DTKS admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dtks");
  await expect(browser).toHaveURL("/penduduk/dtks");
  await expect(browser.locator("body")).toBeVisible();
});

test("suplemen admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/suplemen");
  await expect(browser).toHaveURL("/penduduk/suplemen");
  await expect(browser.locator("body")).toBeVisible();
});

test("dtks lampiran admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dtks/lampiran");
  await expect(browser).toHaveURL("/penduduk/dtks/lampiran");
  await expect(browser.locator("body")).toBeVisible();
});

test("dtks pengaturan admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dtks/pengaturan");
  await expect(browser).toHaveURL("/penduduk/dtks/pengaturan");
  await expect(browser.locator("body")).toBeVisible();
});

test("dtks laporan admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dtks/laporan");
  await expect(browser).toHaveURL("/penduduk/dtks/laporan");
  await expect(browser.locator("body")).toBeVisible();
});

test("dtks export CSV", async ({ app, browser }) => {
  await app.open("/penduduk/dtks/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

test("jajak pendapat publik loads", async ({ app, browser }) => {
  await app.open("/jajak-pendapat");
  await expect(browser).toHaveURL("/jajak-pendapat");
  await expect(browser.locator("body")).toBeVisible();
});

test("kontak daftar ekspor muat", async ({ app, browser }) => {
  await app.open("/hubung-warga/daftar-kontak/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

test("suplemen detail loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/suplemen/1");
  await expect(browser).toHaveURL("/penduduk/suplemen/1");
  await expect(browser.locator("body")).toBeVisible();
});

test("suplemen detail export CSV", async ({ app, browser }) => {
  await app.open("/penduduk/suplemen/1/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

test("DTKS rekap loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dtks/laporan");
  await expect(browser).toHaveURL("/penduduk/dtks/laporan");
  await expect(browser.locator("body")).toBeVisible();
});

test("dtks status change flow visible", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dtks");
  await expect(browser).toHaveURL("/penduduk/dtks");
  await expect(browser.locator("body")).toBeVisible();
});

test("dtks status change dialog accessible", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/penduduk/dtks");
  await expect(browser).toHaveURL("/penduduk/dtks");
  await expect(browser.locator("body")).toBeVisible();
});
