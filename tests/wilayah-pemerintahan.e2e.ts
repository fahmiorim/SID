import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "wilayah admin loads with table",
  { tags: ["smoke"], session: "admin" },
  async ({ app, browser }) => {
    await app.open("/wilayah");
    await expect(browser).toHaveURL("/wilayah");
    await expect(browser.locator("h1")).toContainText("Wilayah");
    await expect(browser.locator("table")).toBeVisible();
  },
);

test("pemerintahan admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/konten/perangkat");
  await expect(browser).toHaveURL("/konten/perangkat");
  await expect(browser.locator("body")).toBeVisible();
});

test("lembaga admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/kelompok?tipe=lembaga");
  await expect(browser).toHaveURL("/kelompok?tipe=lembaga");
  await expect(browser.locator("body")).toBeVisible();
});

test("kelompok-masyarakat admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/kelompok?tipe=kelompok");
  await expect(browser).toHaveURL("/kelompok?tipe=kelompok");
  await expect(browser.locator("body")).toBeVisible();
});

test("pendapat admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/pendapat");
  await expect(browser).toHaveURL("/pendapat");
  await expect(browser.locator("body")).toBeVisible();
});

test("kontak admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/hubung-warga/daftar-kontak");
  await expect(browser).toHaveURL("/hubung-warga/daftar-kontak");
  await expect(browser.locator("body")).toBeVisible();
});

test("pertanahan publik loads with tables", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/desa/pertanahan");
  await expect(browser).toHaveURL("/desa/pertanahan");
  await expect(browser.locator("h1")).toContainText("Data Pertanahan");
});

test("wilayah rekap loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/wilayah/rekap");
  await expect(browser).toHaveURL("/wilayah/rekap");
  await expect(browser.locator("h1")).toContainText("Rekap Wilayah");
});
