import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-POP-006 — DTKS: CRUD dari RTM, status, agregasi anggota, lampiran, pengaturan, laporan, ekspor CSV.
// Impor CSV tersedia via dialog `/penduduk/dtks` (`DtksImportDialog` + `imporDtksAction`)
// dengan pembacaan CSV/XLSX lewat `bacaImporDariFormData`. Pemetaan baris impor kini ada di domain
// (`rencanaImporDtks`) dan diuji: nomor RTM tidak ditemukan, baris ganda, dan normalisasi spasi.
// Test `dtks.test.ts` + `dtks-berkas.test.ts`; E2E di bawah memeriksa dialog dan
// pelaporan RTM tidak ditemukan. **Gap: E2E impor sukses.**
// ============================================================================
test(
  "DTKS impor CSV dialog terbuka dan menerima berkas",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/penduduk/dtks");
    await screen.getByRole("button", { name: /^impor$/i }).tap();
    await expect(screen.getByRole("heading", { name: /impor dtks/i })).toBeVisible();
    // Input berkas CSV/TXT/XLSX
    await expect(screen.getByLabel(/berkas/i)).toBeVisible();
  },
);

test(
  "DTKS impor melaporkan nomor RTM yang tidak ditemukan",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen, browser }) => {
    await app.open("/penduduk/dtks");
    await screen.getByRole("button", { name: /^impor$/i }).tap();
    await expect(screen.getByRole("heading", { name: /impor dtks/i })).toBeVisible();
    await browser.locator('input[type="file"]').setInputFiles("tests/fixtures/dtks-sample.csv");
    await screen
      .getByRole("dialog")
      .getByRole("button", { name: /^impor$/i })
      .tap();
    await expect(screen.getByText(/tidak ditemukan/i).first()).toBeVisible({ timeout: 10000 });
  },
);

// ============================================================================
// OS-POP-012 — Peserta bantuan: kandidat sasaran tenant-aware, snapshot kartu, ubah kartu, ekspor CSV,
// pembersihan massal, dan cetak kartu lewat `window.print()`.
// Impor peserta CSV/XLSX via `PesertaImportDialog` + `imporPesertaAction` dengan kolom identitas per sasaran
// (NIK / No. KK / No. RTM / kode kelompok), unduh template, dan domain `impor-peserta.ts` + test (kode ganda, tidak ditemukan, sudah terdaftar).
// **Gap: E2E impor peserta.** Test `bantuan.test.ts`; E2E detail `/bantuan/999999`.
// ============================================================================
test(
  "peserta bantuan: halaman program bantuan dapat dibuka",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    // Impor peserta berada di dialog detail program; alur unggahnya belum punya
    // E2E (lihat gap OS-POP-012). Yang dijaga di sini hanya halaman program.
    await app.open("/bantuan");
    await expect(screen.getByRole("heading", { name: /bantuan/i })).toBeVisible();
  },
);
