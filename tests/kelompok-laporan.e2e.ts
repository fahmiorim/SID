import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-GOV-004 — Lembaga via `kelompok` tipe `lembaga`: kategori, CRUD, anggota, jabatan, RBAC, publikasi.
// **Cetak via browser** tersedia di halaman daftar.
// **Laporan anggota terperinci** `/kelompok/laporan` (jabatan, NIK, nomor keanggotaan per kelompok) + ekspor CSV `/kelompok/ekspor`;
// domain `laporan-anggota.ts` + test. **Gap: E2E halaman laporan/ekspor belum ada.** E2E admin `/kelompok?tipe=lembaga`.
// ============================================================================
test(
  "lembaga: halaman daftar dengan filter tipe lembaga",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/kelompok?tipe=lembaga");
    await expect(screen.getByRole("heading", { name: /lembaga/i })).toBeVisible();
    // Tabel daftar lembaga
    await expect(screen.locator("table")).toBeVisible({ timeout: 5000 });
  },
);

test(
  "lembaga: laporan anggota terperinci dan ekspor CSV",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen, browser }) => {
    await app.open("/kelompok/laporan?tipe=lembaga");
    await expect(screen.getByRole("heading", { name: /laporan/i })).toBeVisible();
    // Tabel jabatan, NIK, nomor keanggotaan
    await expect(screen.locator("text=/jabatan|NIK|keanggotaan/i")).toBeVisible({ timeout: 5000 });
    // Tombol ekspor CSV
    await expect(browser.locator("text=/ekspor CSV/i")).toBeVisible({ timeout: 3000 });
  },
);

// ============================================================================
// OS-GOV-005 — Kelompok masyarakat: kategori, CRUD, anggota, jabatan, publikasi.
// **Cetak via browser** tersedia di halaman daftar.
// **Laporan anggota terperinci** `/kelompok/laporan` (jabatan, NIK, nomor keanggotaan per kelompok) + ekspor CSV `/kelompok/ekspor`;
// domain `laporan-anggota.ts` + test. Test `kelompok.test.ts`; E2E `/kelompok?tipe=kelompok`.
// ============================================================================
test(
  "kelompok masyarakat: halaman daftar dengan filter tipe kelompok",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/kelompok?tipe=kelompok");
    await expect(screen.getByRole("heading", { name: /kelompok/i })).toBeVisible();
    await expect(screen.locator("table")).toBeVisible({ timeout: 5000 });
  },
);

test(
  "kelompok masyarakat: laporan anggota terperinci dan ekspor CSV",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen, browser }) => {
    await app.open("/kelompok/laporan?tipe=kelompok");
    await expect(screen.getByRole("heading", { name: /laporan/i })).toBeVisible();
    await expect(screen.locator("text=/jabatan|NIK|keanggotaan/i")).toBeVisible({ timeout: 5000 });
    await expect(browser.locator("text=/ekspor CSV/i")).toBeVisible({ timeout: 3000 });
  },
);
