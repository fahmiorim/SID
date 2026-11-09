import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusKelompokDariNama } from "./support/database";

function namaUnik(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
}

/**
 * Katalog: OS-GOV-004 — Lembaga desa: CRUD, anggota, dan laporan
 */
test(
  "lembaga: tambah, lihat anggota, ubah, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const nama = namaUnik("Lembaga Uji");

    try {
      await app.open("/kelompok?tipe=lembaga");
      await expect(browser.locator("h1")).toContainText("Kelompok & Lembaga");

      await screen.getByRole("button", { name: "Tambah Kelompok" }).tap();
      await expect(screen.getByLabel("Tipe")).toBeVisible();
      await screen.getByLabel("Nama").fill(nama);
      await screen.getByLabel("Kode").fill(`LB-${Date.now()}`);
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Kelompok ditambahkan.")).toBeVisible();

      await screen.getByLabel("Cari kelompok").fill(nama);
      await screen.getByRole("button", { name: "Cari" }).tap();
      const baris = screen.getByRole("row").filter({ hasText: nama });
      await expect(baris).toBeVisible();

      // --- Anggota ---------------------------------------------------------
      await baris.getByRole("button", { name: `Aksi untuk ${nama}` }).tap();
      await screen.getByRole("menuitem", { name: "Anggota" }).tap();
      await expect(screen.getByText("Belum ada anggota pada kelompok ini.")).toBeVisible();
      await screen.getByRole("button", { name: "Close" }).first().tap();

      // --- Ubah ------------------------------------------------------------
      await baris.getByRole("button", { name: `Aksi untuk ${nama}` }).tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await screen.getByLabel("Keterangan").fill("Keterangan lembaga uji");
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Kelompok diperbarui.")).toBeVisible();

      // --- Hapus -----------------------------------------------------------
      await screen
        .getByRole("row")
        .filter({ hasText: nama })
        .getByRole("button", {
          name: `Aksi untuk ${nama}`,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      await expect(screen.getByText("Hapus kelompok ini?")).toBeVisible();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Kelompok dihapus.")).toBeVisible();
      await expect(screen.getByText("Tidak ada kelompok yang cocok dengan filter.")).toBeVisible();
    } finally {
      await hapusKelompokDariNama(nama);
    }
  },
);

/**
 * Katalog: OS-GOV-005 — Kelompok masyarakat: tambah dan laporan
 */
test(
  "kelompok masyarakat: tersimpan dan muncul di laporan lembaga/kelompok",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const nama = namaUnik("Kelompok Uji");

    try {
      await app.open("/kelompok?tipe=kelompok");
      await screen.getByRole("button", { name: "Tambah Kelompok" }).tap();
      await screen.getByLabel("Nama").fill(nama);
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Kelompok ditambahkan.")).toBeVisible();

      await app.open(`/kelompok?tipe=kelompok&q=${encodeURIComponent(nama)}`);
      await expect(screen.getByRole("row").filter({ hasText: nama })).toBeVisible();

      await app.open("/kelompok/laporan?tipe=kelompok");
      await expect(browser.locator("h1")).toContainText("Laporan");
      await expect(screen.getByRole("link", { name: /Ekspor CSV/ })).toHaveAttribute(
        "href",
        "/kelompok/ekspor?tipe=kelompok",
      );
    } finally {
      await hapusKelompokDariNama(nama);
    }
  },
);

/**
 * Katalog: OS-GOV-002 — Perangkat desa & SOTK
 */
test(
  "perangkat desa: halaman admin dan publik memuat SOTK",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/konten/perangkat");
    await expect(screen.getByRole("heading", { name: "Perangkat Desa" })).toBeVisible();
    await expect(screen.getByRole("table").first()).toBeVisible();

    await app.open("/desa/pemerintahan");
    await expect(browser.locator("h1, h2").first()).toBeVisible();
  },
);
