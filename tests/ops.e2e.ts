import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("pengaturan desa loads", { tags: ["smoke"], session: "admin" }, async ({ app, browser }) => {
  await app.open("/pengaturan/desa");
  await expect(browser).toHaveURL("/pengaturan/desa");
  await expect(browser.locator("body")).toBeVisible();
});

test("grup/role admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/pengaturan/grup");
  await expect(browser).toHaveURL("/pengaturan/grup");
  await expect(browser.locator("body")).toBeVisible();
});

test("pengguna admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/pengaturan/pengguna");
  await expect(browser).toHaveURL("/pengaturan/pengguna");
  await expect(browser.locator("body")).toBeVisible();
});

test("modul admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/pengaturan/modul");
  await expect(browser).toHaveURL("/pengaturan/modul");
  await expect(browser.locator("body")).toBeVisible();
});

test("audit log loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/pengaturan/log-aktivitas");
  await expect(browser).toHaveURL("/pengaturan/log-aktivitas");
  await expect(browser.locator("body")).toBeVisible();
});

test("database admin loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/pengaturan/database");
  await expect(browser).toHaveURL("/pengaturan/database");
  await expect(browser.locator("body")).toBeVisible();
});

test("masuk page loads", { session: "admin" }, async ({ app, browser }) => {
  // Admin sudah terotentikasi, jadi `/masuk` mengalihkan ke `/beranda` (lihat page.tsx).
  await app.open("/masuk");
  await expect(browser).toHaveURL("/beranda");
  await expect(browser.locator("body")).toBeVisible();
});

test("lupa sandi page loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/lupa-sandi");
  await expect(browser).toHaveURL("/lupa-sandi");
  await expect(browser.locator("body")).toBeVisible();
});
