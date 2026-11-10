import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-FIN-006, OS-WEB-014.
test("APBDes publik: ringkasan, bidang, triwulan, dan fallback tahun", async ({
  app,
  screen,
  browser,
}) => {
  await app.open("/desa/apbdes");

  await expect(
    screen.getByRole("heading", { name: "Transparansi APBDes", level: 1 }),
  ).toBeVisible();
  await expect(screen.getByRole("heading", { name: "Ringkasan Anggaran" })).toBeVisible();
  await expect(screen.getByRole("heading", { name: "Realisasi Belanja per Bidang" })).toBeVisible();
  await expect(
    screen.getByRole("heading", { name: "Realisasi per Periode (Triwulan)" }),
  ).toBeVisible();

  const teksAwal = String(await browser.locator("main").textContent());
  const tahunAwal = teksAwal.match(/tahun (\d{4})/)?.[1];
  expect(tahunAwal).toBeTruthy();

  // Format tahun salah tidak boleh menghasilkan halaman galat; laporan jatuh
  // ke tahun terakhir yang tersedia dan URL tetap dapat dibagikan.
  await app.open("/desa/apbdes?tahun=abc");
  await expect(browser).toHaveURL(/tahun=abc$/);
  const teksSalah = String(await browser.locator("main").textContent());
  expect(teksSalah).toContain(`tahun ${tahunAwal}`);

  // Tahun yang belum punya anggaran juga tidak mengosongkan laporan; yang
  // tampil tetap tahun tersedia terakhir, bukan halaman kosong.
  await app.open("/desa/apbdes?tahun=2099");
  const teksTanpaData = String(await browser.locator("main").textContent());
  expect(teksTanpaData).toContain(`tahun ${tahunAwal}`);
  expect(teksTanpaData).not.toContain("Terjadi kesalahan pada server");
});
