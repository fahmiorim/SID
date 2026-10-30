import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "health pages load without auth and show data tables",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    // KIA page
    await app.open("/desa/kesehatan/kia");
    await expect(browser).toHaveURL("/desa/kesehatan/kia");
    await expect(browser.locator("h1")).toContainText("Kesehatan Ibu dan Anak (KIA)");
    await expect(browser.locator("table")).toBeVisible();

    // Ibu Hamil page
    await app.open("/desa/kesehatan/ibu-hamil");
    await expect(browser).toHaveURL("/desa/kesehatan/ibu-hamil");
    await expect(browser.locator("h1")).toContainText("Pemantauan Ibu Hamil");
    await expect(browser.locator("table")).toBeVisible();

    // Pemantauan Anak page
    await app.open("/desa/kesehatan/pemantauan-anak");
    await expect(browser).toHaveURL("/desa/kesehatan/pemantauan-anak");
    await expect(browser.locator("h1")).toContainText("Pemantauan Anak");
    await expect(browser.locator("table")).toBeVisible();
  },
);

test(
  "health CSV export routes return valid HTML tables with download links",
  { session: "admin" },
  async ({ app, browser }) => {
    // Rute ini mengembalikan HTML dengan tabel data dan tautan unduh CSV,
    // bukan CSV mentah, agar browser menampilkannya secara inline (transparansi publik).
    await app.open("/desa/kesehatan/kia/ekspor");
    await expect(browser).toHaveURL("/desa/kesehatan/kia/ekspor");
    await expect(browser.locator("body")).toContainText("Kesehatan Ibu dan Anak (KIA)");
    await expect(browser.locator("body")).toContainText("Unduh CSV");

    await app.open("/desa/kesehatan/ibu-hamil/ekspor");
    await expect(browser).toHaveURL("/desa/kesehatan/ibu-hamil/ekspor");
    await expect(browser.locator("body")).toContainText("Pemantauan Ibu Hamil");
    await expect(browser.locator("body")).toContainText("Unduh CSV");

    await app.open("/desa/kesehatan/pemantauan-anak/ekspor");
    await expect(browser).toHaveURL("/desa/kesehatan/pemantauan-anak/ekspor");
    await expect(browser.locator("body")).toContainText("Pemantauan Anak");
    await expect(browser.locator("body")).toContainText("Unduh CSV");
  },
);
