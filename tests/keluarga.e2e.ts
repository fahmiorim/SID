import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusKeluargaDariNomor } from "./support/database";

function nomorKkUnik(): string {
  return `3201${String(Date.now()).slice(-8)}${Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, "0")}`;
}

/**
 * Katalog: OS-POP-003 — Kartu Keluarga: CRUD, anggota, dan cetak
 */
test(
  "kartu keluarga: tambah, detail, ubah alamat, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const nomor = nomorKkUnik();
    const alamat = `Alamat KK ${Date.now()}`;

    try {
      await app.open("/keluarga");
      await expect(browser.locator("h1")).toContainText("Kartu Keluarga");

      // --- Tambah ----------------------------------------------------------
      await screen.getByRole("button", { name: "Tambah Kartu Keluarga" }).tap();
      await screen.getByLabel("Nomor Kartu Keluarga").fill(nomor);
      await screen.getByLabel("Alamat").fill(alamat);
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Kartu Keluarga ditambahkan.")).toBeVisible();

      // --- Cari & detail ---------------------------------------------------
      await screen.getByLabel("Cari Kartu Keluarga").fill(nomor);
      await screen.getByRole("button", { name: "Cari" }).tap();
      const baris = screen.getByRole("row").filter({ hasText: nomor });
      await expect(baris).toBeVisible();

      // Server Action di atas memicu refresh daftar; buka ulang agar menu aksi
      // tidak tertutup oleh refresh yang masih berjalan.
      await app.open(`/keluarga?q=${nomor}`);
      await baris.getByRole("button", { name: /Aksi untuk/ }).tap();
      await expect(screen.getByRole("menuitem", { name: "Detail" })).toHaveAttribute(
        "href",
        /\/keluarga\/\d+/,
      );
      await expect(screen.getByRole("menuitem", { name: "Cetak KK" })).toHaveAttribute(
        "href",
        /\/pdf$/,
      );
      await screen.getByRole("menuitem", { name: "Anggota" }).tap();
      await expect(screen.getByText(/Anggota/).first()).toBeVisible();
      await expect(
        screen.getByText("Belum ada penduduk yang ditautkan ke Kartu Keluarga ini."),
      ).toBeVisible();
      await screen.getByRole("button", { name: "Tutup dialog" }).first().tap();

      // --- Ubah ------------------------------------------------------------
      await baris.getByRole("button", { name: /Aksi untuk/ }).tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await screen.getByLabel("Alamat").fill(`${alamat} baru`);
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Kartu Keluarga diperbarui.")).toBeVisible();
      await app.open(`/keluarga?q=${nomor}`);

      await screen
        .getByRole("row")
        .filter({ hasText: nomor })
        .getByRole("button", {
          name: /Aksi untuk/,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await expect(screen.getByLabel("Alamat")).toHaveValue(`${alamat} baru`);
      await screen.getByRole("button", { name: "Batal" }).tap();

      // --- Hapus -----------------------------------------------------------
      await screen
        .getByRole("row")
        .filter({ hasText: nomor })
        .getByRole("button", {
          name: /Aksi untuk/,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      await expect(screen.getByText("Hapus Kartu Keluarga?")).toBeVisible();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Kartu Keluarga dihapus.")).toBeVisible();

      await app.open(`/keluarga?q=${nomor}`);
      await expect(
        screen.getByText("Tidak ada Kartu Keluarga yang cocok dengan pencarian."),
      ).toBeVisible();
    } finally {
      await hapusKeluargaDariNomor(nomor);
    }
  },
);
