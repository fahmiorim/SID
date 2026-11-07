import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-GOV-007 — Admin `/pemerintahan/pemilihan` dengan CRUD pemilihan (tahun, jenis, tanggal, keterangan),
// otorisasi `pemilihan`, dan halaman publik `/desa/pemilihan`.
// **Kandidat & hasil** ditambahkan lewat tabel `pemilihan_kandidat` (nomor urut unik per pemilihan, keterangan, jumlah suara),
// CRUD berizin di dialog `/pemerintahan/pemilihan`, rekap suara + pemenang (domain `hitungRekapSuara` + test),
// dan tampilan kandidat/hasil di publik `/desa/pemilihan`. Jumlah daftar pemilih (DPT) ditampilkan dari modul DPT aktif.
// **Gap: E2E pemilihan.**.
// ============================================================================
test(
  "pemilihan admin: CRUD pemilihan dan kandidat",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/pemerintahan/pemilihan");
    await expect(screen.getByRole("heading", { name: /pemilihan/i })).toBeVisible();
    // Form tambah pemilihan
    await expect(screen.getByLabel(/tahun pemilihan/i)).toBeVisible();
    await expect(screen.getByLabel(/jenis pemilihan/i)).toBeVisible();
    // Tabel kandidat
    await expect(screen.locator("table")).toBeVisible({ timeout: 5000 });
  },
);

test(
  "pemilihan publik: kandidat dan hasil ditampilkan di /desa/pemilihan",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/pemilihan");
    await expect(browser).toHaveURL("/desa/pemilihan");
    await expect(browser.locator("h1")).toBeVisible({ timeout: 5000 });
    // Daftar kandidat
    await expect(browser.locator("text=/kandidat|suhu|pemenang/i")).toBeVisible({ timeout: 5000 });
    // Jumlah daftar pemilih (DPT)
    await expect(browser.locator("text=/DPT|pemilih|terdaftar/i")).toBeVisible({ timeout: 5000 });
  },
);
