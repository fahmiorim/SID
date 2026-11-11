import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusItemBukuDariUraian } from "./support/database";

/**
 * Katalog: OS-FIN-009 — buku administrasi umum/sekretariat.
 *
 * Buku diambil dari daftar yang sudah di-seed, lalu satu item ditambahkan,
 * diubah, dan dibuka pada halaman cetak resmi. Ini membuktikan item tidak hanya
 * tersimpan tetapi juga terbaca oleh tampilan buku, bukan sekadar smoke.
 */
test(
  "OS-FIN-009 — item buku administrasi ditambah, diubah, dan tercetak",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const uraian = `Catatan Buku E2E ${cap}`;
    const uraianBaru = `${uraian} diperbarui`;

    try {
      await app.open("/bumindes/buku-administrasi");
      await expect(screen.getByRole("heading", { name: "Buku Administrasi Desa" })).toBeVisible();

      const tautanBuku = screen.getByRole("link").filter({ hasText: "Kode:" }).first();
      await tautanBuku.tap();
      await expect(browser).toHaveURL(/\/bumindes\/buku-administrasi\/\d+/);

      await screen.getByRole("button", { name: "Tambah Item" }).tap();
      const dialogTambah = screen.getByRole("dialog", { name: "Tambah Item Buku" });
      await expect(dialogTambah).toBeVisible();
      await dialogTambah.getByLabel("Uraian").fill(uraian);
      await dialogTambah.getByLabel("Keterangan").fill("Data uji E2E");
      await dialogTambah.getByRole("button", { name: "Tambah item" }).tap();
      await expect(screen.getByText("Item ditambahkan.")).toBeVisible({ timeout: 10_000 });
      await expect(screen.getByRole("row").filter({ hasText: uraian })).toBeVisible();

      await screen.getByRole("button", { name: `Aksi item ${uraian}` }).tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      const dialogUbah = screen.getByRole("dialog", { name: "Ubah Item Buku" });
      await expect(dialogUbah).toBeVisible();
      await dialogUbah.getByLabel("Uraian").fill(uraianBaru);
      await dialogUbah.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Item diperbarui.")).toBeVisible({ timeout: 10_000 });
      await expect(screen.getByRole("row").filter({ hasText: uraianBaru })).toBeVisible();

      // Halaman cetak membaca item yang sama dari buku.
      await screen.getByRole("link", { name: "Cetak", exact: true }).tap();
      await expect(browser).toHaveURL(/\/bumindes\/buku-administrasi\/\d+\/cetak$/);
      await expect(screen.getByText(uraianBaru)).toBeVisible();
    } finally {
      await hapusItemBukuDariUraian(uraian);
      await hapusItemBukuDariUraian(uraianBaru);
    }
  },
);
