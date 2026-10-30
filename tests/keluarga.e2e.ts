import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "keluarga admin loads with table",
  { tags: ["smoke"], session: "admin" },
  async ({ app, browser }) => {
    await app.open("/keluarga");
    await expect(browser).toHaveURL("/keluarga");
    await expect(browser.locator("h1")).toContainText("Kartu Keluarga");
    await expect(browser.locator("table")).toBeVisible();
  },
);

test("keluarga detail page loads", { session: "admin" }, async ({ app, browser }) => {
  // Detail KK menampilkan tabel anggota + riwayat perubahan.
  await app.open("/keluarga/999999");
  await expect(browser).toHaveURL("/keluarga/999999");
  await expect(browser.locator("body")).toBeVisible();
});

test("statistik rentang umur loads", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/statistik/rentang-umur");
  await expect(browser).toHaveURL("/statistik/rentang-umur");
  await expect(browser.locator("body")).toBeVisible();
});

test("statistik rentang umur export", async ({ app, browser }) => {
  await app.open("/statistik/rentang-umur/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});
