import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "verifikasi surat token page loads publicly",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/verifikasi-surat/token-test");
    // Halaman verifikasi bisa diakses publik (mengacu pada router verifikasi).
    await expect(browser.locator("body")).toBeVisible();
  },
);

test("public health pages accessible without auth", async ({ app, browser }) => {
  await app.open("/desa/kesehatan/kia");
  await expect(browser).toHaveURL("/desa/kesehatan/kia");
  await expect(browser.locator("table")).toBeVisible();

  await app.open("/desa/kesehatan/ibu-hamil");
  await expect(browser).toHaveURL("/desa/kesehatan/ibu-hamil");
  await expect(browser.locator("table")).toBeVisible();
});

test("DPT publik accessible", async ({ app, browser }) => {
  await app.open("/desa/dpt");
  await expect(browser).toHaveURL("/desa/dpt");
  await expect(browser.locator("body")).toBeVisible();
});

test("bantuan publik accessible", async ({ app, browser }) => {
  await app.open("/desa/bantuan");
  await expect(browser).toHaveURL("/desa/bantuan");
  await expect(browser.locator("body")).toBeVisible();
});
