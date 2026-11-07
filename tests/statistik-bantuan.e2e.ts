import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-POP-010 — Statistik penduduk `/statistik/penduduk`, rentang umur, filter wilayah/umur, ekspor CSV,
// cetak browser, dan ekspor PDF `/statistik/penduduk/ekspor/pdf`. **Ditambah test rute ekspor PDF**
// (mock sesi/use case/repo): menolak tanpa sesi (401), menolak tanpa izin (403), mengembalikan
// `application/pdf` dengan header unduhan dan awalan `%PDF-`, serta memakai `kind` bawaan untuk parameter tak dikenal.
// **Gap: E2E khusus ekspor PDF.** E2E `statistik-bantuan.e2e.ts`.
// ============================================================================
test(
  "statistik penduduk: halaman utama dan filter umur",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");
    await expect(browser).toHaveURL("/statistik/penduduk");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
    // Filter umur
    await expect(browser.locator('[name="umur"]')).toBeVisible({ timeout: 3000 });
  },
);

test(
  "statistik penduduk: ekspor PDF berhasil diunduh",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk/ekspor/pdf");
    await expect(browser).toHaveURL("/statistik/penduduk/ekspor/pdf");
    // Cek header PDF
    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");
  },
);

// ============================================================================
// OS-POP-011 — Program bantuan: CRUD, detail, peserta, ekspor CSV, RBAC. **Cetak via browser**
// ditambahkan di detail program (`/bantuan/[id]`). **Laporan resmi** `/bantuan/[id]/cetak` ber-kop desa
// (identitas program, daftar peserta, kolom tanda tangan) tertaut dari halaman detail.
// **Gap: E2E laporan resmi belum ada.** Test `bantuan.test.ts`; E2E `statistik-bantuan.e2e.ts`.
// ============================================================================
test("program bantuan: halaman daftar program", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/bantuan");
  await expect(browser).toHaveURL("/bantuan");
  await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
  // Daftar program
  await expect(browser.locator("text=/program|detail|info/i")).toBeVisible({ timeout: 5000 });
});

test("program bantuan: laporan resmi cetak", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/bantuan/1/cetak");
  await expect(browser).toHaveURL("/bantuan/1/cetak");
  await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
  // Cek isian laporan: kop desa, identitas program, daftar peserta, kolom tanda tangan
  await expect(browser.locator("text=/kop desa|identitas program|tanda tangan/i")).toBeVisible({
    timeout: 5000,
  });
});

// ============================================================================
// OS-POP-013 — Statistik bantuan per program/sasaran, filter wilayah/periode, ekspor CSV, cetak browser,
// dan ekspor PDF `/statistik/bantuan/ekspor/pdf`. Filter **kategori sasaran** kini tersedia di halaman
// dan diteruskan ke ekspor CSV/PDF; tombol Unduh PDF ditautkan ke rute nyata. Hitungan per sasaran
// memakai jumlah peserta (`COUNT(bantuan_peserta.id)`) sehingga program tanpa peserta tidak lagi terhitung.
// **Gap: E2E ekspor PDF.** Test `statistik.test.ts`; E2E `statistik-bantuan.e2e.ts`.
// ============================================================================
test(
  "statistik bantuan: halaman utama dengan filter kategori sasaran",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan");
    await expect(browser).toHaveURL("/statistik/bantuan");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
    // Filter kategori sasaran
    await expect(browser.locator('[name="kategori"]')).toBeVisible({ timeout: 3000 });
  },
);

test(
  "statistik bantuan: ekspor PDF berhasil diunduh",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan/ekspor/pdf");
    await expect(browser).toHaveURL("/statistik/bantuan/ekspor/pdf");
    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");
  },
);
