import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("anggaran (APBDes) loads", { tags: ["smoke"], session: "admin" }, async ({ app, browser }) => {
  await app.open("/keuangan/anggaran");
  await expect(browser).toHaveURL("/keuangan/anggaran");
  await expect(browser.locator("h1")).toContainText("APBDes");
});

test("laporan keuangan loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/keuangan/laporan");
  await expect(browser).toHaveURL("/keuangan/laporan");
  await expect(browser.locator("body")).toBeVisible();
});

test("rekonsiliasi loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/keuangan/rekonsiliasi");
  await expect(browser).toHaveURL("/keuangan/rekonsiliasi");
  await expect(browser.locator("body")).toBeVisible();
});

test("triwulan loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/keuangan/triwulan");
  await expect(browser).toHaveURL("/keuangan/triwulan");
  await expect(browser.locator("body")).toBeVisible();
});

test("laporan dokumen loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/keuangan/laporan-dokumen");
  await expect(browser).toHaveURL("/keuangan/laporan-dokumen");
  await expect(browser.locator("body")).toBeVisible();
});

test("inventaris loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/inventaris");
  await expect(browser).toHaveURL("/inventaris");
  await expect(browser.locator("body")).toBeVisible();
});

test("inventaris kategori loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/inventaris/kategori");
  await expect(browser).toHaveURL("/inventaris/kategori");
  await expect(browser.locator("body")).toBeVisible();
});

test("inventaris mutasi loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/inventaris/mutasi");
  await expect(browser).toHaveURL("/inventaris/mutasi");
  await expect(browser.locator("body")).toBeVisible();
});

test("bumindes loads", { session: "admin" }, async ({ app, browser }) => {
  // `/bumindes` adalah pintu masuk yang otomatis mengarahkan ke buku administrasi umum.
  await app.open("/bumindes");
  await expect(browser).toHaveURL("/bumindes/buku-administrasi");
  await expect(browser.locator("body")).toBeVisible();
});

test("bumindes buku-administrasi loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/bumindes/buku-administrasi");
  await expect(browser).toHaveURL("/bumindes/buku-administrasi");
  await expect(browser.locator("body")).toBeVisible();
});
