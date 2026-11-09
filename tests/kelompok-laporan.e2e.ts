import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusKategoriKelompokDariNama, hapusKelompokDariNama } from "./support/database";

function namaUnik(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
}

/**
 * Katalog: OS-GOV-004/005 — Kategori kelompok & lembaga
 */
test(
  "kategori kelompok: tambah, ubah, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const nama = namaUnik("Kategori Uji");

    try {
      await app.open("/kelompok/kategori");
      await expect(browser.locator("h1")).toContainText("Kategori");

      await screen.getByRole("button", { name: "Tambah Kategori" }).tap();
      await screen.getByLabel("Nama Kategori").fill(nama);
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Kategori ditambahkan.")).toBeVisible();
      await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();

      const baris = screen.getByRole("row").filter({ hasText: nama });
      await baris.getByRole("button", { name: /Aksi untuk/ }).tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await screen.getByLabel("Nama Kategori").fill(`${nama} baru`);
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Kategori diperbarui.")).toBeVisible();

      await screen
        .getByRole("row")
        .filter({ hasText: `${nama} baru` })
        .getByRole("button", {
          name: /Aksi untuk/,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Kategori dihapus.")).toBeVisible();
    } finally {
      await hapusKategoriKelompokDariNama(nama);
      await hapusKategoriKelompokDariNama(`${nama} baru`);
    }
  },
);

/**
 * Katalog: OS-GOV-004/005 — Anggota kelompok: jabatan dan publikasi
 */
test(
  "anggota kelompok: tambah dengan jabatan lalu keluarkan",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen }) => {
    const nama = namaUnik("Kelompok Anggota");

    try {
      await app.open("/kelompok?tipe=kelompok");
      await screen.getByRole("button", { name: "Tambah Kelompok" }).tap();
      await screen.getByLabel("Nama").fill(nama);
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Kelompok ditambahkan.")).toBeVisible();

      await screen.getByLabel("Cari kelompok").fill(nama);
      await screen.getByRole("button", { name: "Cari" }).tap();
      await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();

      // Server Action di atas memicu refresh daftar; buka ulang agar menu aksi
      // tidak tertutup oleh refresh yang masih berjalan.
      await app.open(`/kelompok?tipe=kelompok&q=${encodeURIComponent(nama)}`);
      await screen
        .getByRole("row")
        .filter({ hasText: nama })
        .getByRole("button", {
          name: `Aksi untuk ${nama}`,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Anggota" }).tap();

      await screen.getByLabel("Penduduk").tap();
      await screen.getByRole("option").first().tap();
      await screen.getByLabel("No. Anggota").fill("A-001");
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Anggota kelompok ditambahkan.")).toBeVisible();
      // Nama penduduk berasal dari data seed, jadi keberadaan anggota dibuktikan
      // lewat tombol Keluarkan yang hanya dirender pada baris anggota.
      await screen
        .getByRole("button", { name: /^Keluarkan / })
        .first()
        .tap();
      await expect(screen.getByText("Anggota dikeluarkan dari kelompok.")).toBeVisible();
      await expect(screen.getByText("Belum ada anggota pada kelompok ini.")).toBeVisible();
    } finally {
      await hapusKelompokDariNama(nama);
    }
  },
);

/**
 * Katalog: OS-GOV-004/005 — Laporan anggota dan ekspor CSV
 */
test(
  "laporan anggota kelompok: ekspor CSV tersedia",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/kelompok/laporan?tipe=lembaga");
    await expect(browser.locator("h1")).toContainText("Laporan Anggota Lembaga Desa");
    await expect(screen.getByRole("link", { name: /Ekspor CSV/ })).toHaveAttribute(
      "href",
      "/kelompok/ekspor?tipe=lembaga",
    );
  },
);
