import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatProgramBantuanDariNama, hapusProgramBantuanDariNama } from "./support/database";

function namaUnik(): string {
  return `Program Bantuan E2E ${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
}

/**
 * Katalog: OS-POP-011 — Program bantuan: tambah, ubah, lalu hapus.
 */
test(
  "program bantuan: tambah, ubah, dan hapus",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const nama = namaUnik();

    try {
      await app.open("/bantuan");
      await expect(screen.getByRole("heading", { name: /bantuan/i }).first()).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Program" }).tap();
      await screen.getByLabel("Nama Program").fill(nama);
      await screen.getByLabel("Asal Dana").tap();
      await screen.getByRole("option", { name: "Desa" }).tap();
      await screen.getByLabel("Tanggal Mulai").fill("2024-01-01");
      await screen.getByLabel("Tanggal Akhir").fill("2024-12-31");
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();

      await screen.getByRole("button", { name: `Aksi untuk program ${nama}` }).tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await screen.getByLabel("Nama Program").fill(`${nama} ubah`);
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByRole("cell", { name: `${nama} ubah`, exact: true })).toBeVisible();

      await screen.getByRole("button", { name: `Aksi untuk program ${nama} ubah` }).tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByRole("cell", { name: `${nama} ubah`, exact: true })).toHaveCount(0);
    } finally {
      await hapusProgramBantuanDariNama(nama);
      await hapusProgramBantuanDariNama(`${nama} ubah`);
    }
  },
);

/**
 * Katalog: OS-POP-012 — Peserta bantuan: tautkan penduduk lalu keluarkan.
 */
test(
  "peserta bantuan: tambah dari dialog lalu keluarkan",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const nama = namaUnik();
    await buatProgramBantuanDariNama(nama);

    try {
      await app.open("/bantuan");
      await screen.getByRole("button", { name: `Aksi untuk program ${nama}` }).tap();
      await screen.getByRole("menuitem", { name: "Peserta" }).tap();
      await expect(screen.getByText("Belum ada peserta pada program ini.")).toBeVisible();

      await screen.getByLabel("Penduduk").tap();
      await screen.getByRole("option").first().tap();
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("1 peserta terdaftar.")).toBeVisible();
      await expect(screen.getByRole("button", { name: /^Keluarkan / })).toHaveCount(1);

      await screen
        .getByRole("button", { name: /^Keluarkan / })
        .first()
        .tap();
      await expect(screen.getByText("Belum ada peserta pada program ini.")).toBeVisible();
    } finally {
      await hapusProgramBantuanDariNama(nama);
    }
  },
);

/**
 * Katalog: OS-POP-011/012 — Laporan resmi ber-kop desa dan ekspor CSV peserta.
 */
test(
  "laporan resmi dan ekspor CSV memuat peserta program",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const nama = namaUnik();
    const id = await buatProgramBantuanDariNama(nama);

    try {
      await app.open("/bantuan");
      await screen.getByRole("button", { name: `Aksi untuk program ${nama}` }).tap();
      await screen.getByRole("menuitem", { name: "Peserta" }).tap();
      await screen.getByLabel("Penduduk").tap();
      await screen.getByRole("option").first().tap();
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("1 peserta terdaftar.")).toBeVisible();

      await app.open(`/bantuan/${id}/cetak`);
      await expect(browser.locator("h1")).toBeVisible();
      const teks = await browser.locator("body").textContent();
      expect(teks).toContain(nama);
      expect(teks).toMatch(/daftar peserta/i);
      expect(teks).toMatch(/kepala desa/i);
      expect(teks).toContain("Daftar Peserta (1 orang)");

      await app.open(`/bantuan/${id}`);
      const csv = await browser.evaluate(async (programId) => {
        const res = await fetch(`/bantuan/ekspor?programId=${programId}`);
        return {
          status: res.status,
          contentType: res.headers.get("content-type"),
          body: await res.text(),
        };
      }, id);
      expect(csv.status).toBe(200);
      expect(csv.contentType).toContain("text/csv");
      // Header + satu baris peserta.
      expect(csv.body.trim().split(/\r?\n/).length).toBeGreaterThan(1);
    } finally {
      await hapusProgramBantuanDariNama(nama);
    }
  },
);
