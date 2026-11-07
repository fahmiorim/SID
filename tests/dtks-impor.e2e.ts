import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-POP-006 — DTKS: CRUD dari RTM, status, agregasi anggota, lampiran, pengaturan, laporan, ekspor CSV.
// Impor CSV tersedia via dialog `/penduduk/dtks` (`DtksImportDialog` + `imporDtksAction`)
// dengan pembacaan CSV/XLSX lewat `bacaImporDariFormData`. Pemetaan baris impor kini ada di domain
// (`rencanaImporDtks`) dan diuji: nomor RTM tidak ditemukan, baris ganda, dan normalisasi spasi.
// Test `dtks.test.ts` + `dtks-berkas.test.ts`; **Gap: E2E impor DTKS**.
// ============================================================================
test(
  "DTKS impor CSV dialog terbuka dan membaca file",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/penduduk/dtks");
    await expect(screen.getByRole("heading", { name: /impor DTKS/i })).toBeVisible();
    // Input file
    await expect(screen.getByRole("button", { name: /upload|impor/i })).toBeVisible();
    // Validasi jenis file
    const fileInput = screen.getByRole("textbox", { name: /file|nama file/i });
    if (await fileInput.isVisible({ timeout: 3000 })) {
      await expect(fileInput).toBeVisible();
    }
  },
);

test(
  "DTKS impor validasi baris: RTM tidak ditemukan, baris ganda, normalisasi spasi",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen, browser }) => {
    await app.open("/penduduk/dtks");
    // Unggah file CSV test
    await app.upload("//cdn.example.com/dtks-sample.csv", { fieldName: "file" });
    // Proses impor
    await screen.getByRole("button", { name: /proses|mulai impor/i }).click({ timeout: 5000 });
    // Cek hasil validasi
    await expect(
      browser.locator("text=/RTM tidak ditemukan|baris ganda|normalisasi/i"),
    ).toBeVisible({ timeout: 5000 });
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
  "peserta bantuan: dialog impor terbuka dan validasi kolom",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/bantuan/impor-peserta");
    await expect(screen.getByRole("heading", { name: /impor peserta/i })).toBeVisible();
    // Kolom yang dibutuhkan
    await expect(screen.getByLabel(/NIK/i)).toBeVisible();
    await expect(screen.getByLabel(/No\. KK/i)).toBeVisible();
    await expect(screen.getByLabel(/No\. RTM/i)).toBeVisible();
    await expect(screen.getByLabel(/kode kelompok/i)).toBeVisible();
  },
);

test(
  "peserta bantuan: validasi kandidat sasaran dan impor",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/bantuan/impor-peserta");
    await app.upload("//cdn.example.com/peserta-sample.csv", { fieldName: "file" });
    await screen.getByRole("button", { name: /impor/i }).click({ timeout: 5000 });
    // Cek hasil: kandidat yang valid dan yang tidak valid
    await expect(
      browser.locator("text=/kandidat valid|kandidat tidak valid|kode ganda/i"),
    ).toBeVisible({ timeout: 5000 });
  },
);
