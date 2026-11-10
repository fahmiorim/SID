import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Katalog: OS-SUR-001 (daftar permohonan surat) dan OS-KON-001..004 (konten).
 *
 * Test ini menelusuri pengelolaan konten lewat dialog admin: menambah,
 * mengubah, dan menghapus menu; menambah lalu menghapus widget dan dokumen;
 * serta memastikan dialog slider terbuka. Sebelumnya test hanya membuka
 * halaman tanpa berinteraksi.
 */
test(
  "surat-konten: CRUD menu, widget, dan dokumen lewat dialog admin",
  { session: "admin", timeout: 240_000 },
  async ({ app, screen }) => {
    const cap = Date.now();
    const namaMenu = `Menu Uji ${cap}`;
    const namaMenuBaru = `Menu Ubah ${cap}`;
    const judulWidget = `Widget Uji ${cap}`;
    const namaDokumen = `Dokumen Uji ${cap}`;

    // Daftar permohonan surat tetap termuat dengan tabel rekapnya.
    await app.open("/permohonan-surat");
    await expect(screen.getByRole("table").first()).toBeVisible();

    // Menu: tambah, ubah nama, lalu hapus.
    await app.open("/konten/menu");
    await expect(screen.getByRole("button", { name: "Tambah menu" })).toBeVisible();
    await screen.getByRole("button", { name: "Tambah menu" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Menu" })).toBeVisible();
    await screen.getByLabel("Nama menu").fill(namaMenu);
    await screen.getByLabel("Link").fill(`/desa/uji-${cap}`);
    await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
    await expect(screen.getByRole("row", { name: new RegExp(namaMenu) })).toBeVisible({
      timeout: 10_000,
    });

    await screen.getByRole("button", { name: `Ubah ${namaMenu}` }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Menu" })).toBeVisible();
    await screen.getByLabel("Nama menu").fill(namaMenuBaru);
    await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
    await expect(screen.getByRole("row", { name: new RegExp(namaMenuBaru) })).toBeVisible({
      timeout: 10_000,
    });

    await screen.getByRole("button", { name: `Hapus ${namaMenuBaru}` }).tap();
    await expect(screen.getByRole("alertdialog", { name: "Hapus menu?" })).toBeVisible();
    await screen.getByRole("alertdialog").getByRole("button", { name: "Hapus" }).tap();
    await expect(screen.getByRole("row", { name: new RegExp(namaMenuBaru) })).not.toBeVisible({
      timeout: 10_000,
    });

    // Widget: tambah lalu hapus.
    await app.open("/konten/widget");
    await screen.getByRole("button", { name: "Tambah widget" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Widget" })).toBeVisible();
    await screen.getByLabel("Judul widget").fill(judulWidget);
    await screen.getByLabel("Isi").fill("Isi widget uji E2E.");
    await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
    await expect(screen.getByRole("row", { name: new RegExp(judulWidget) })).toBeVisible({
      timeout: 10_000,
    });

    await screen.getByRole("button", { name: `Hapus ${judulWidget}` }).tap();
    await expect(screen.getByRole("alertdialog", { name: "Hapus widget?" })).toBeVisible();
    await screen.getByRole("alertdialog").getByRole("button", { name: "Hapus" }).tap();
    await expect(screen.getByRole("row", { name: new RegExp(judulWidget) })).not.toBeVisible({
      timeout: 10_000,
    });

    // Dokumen: tambah lalu hapus.
    await app.open("/konten/dokumen");
    await screen.getByRole("button", { name: "Tambah dokumen" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Dokumen" })).toBeVisible();
    await screen.getByLabel("Nama dokumen").fill(namaDokumen);
    await screen.getByLabel("Path berkas").fill(`/media/desa/dokumen/uji-${cap}.pdf`);
    await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
    await expect(screen.getByRole("row", { name: new RegExp(namaDokumen) })).toBeVisible({
      timeout: 10_000,
    });

    await screen.getByRole("button", { name: `Hapus ${namaDokumen}` }).tap();
    await expect(screen.getByRole("alertdialog", { name: "Hapus dokumen?" })).toBeVisible();
    await screen.getByRole("alertdialog").getByRole("button", { name: "Hapus" }).tap();
    await expect(screen.getByRole("row", { name: new RegExp(namaDokumen) })).not.toBeVisible({
      timeout: 10_000,
    });

    // Slider: dialog tambah terbuka dengan field gambarnya.
    await app.open("/konten/slider");
    await screen.getByRole("button", { name: "Tambah slider" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Slider" })).toBeVisible();
    await expect(screen.getByLabel("Judul slide")).toBeVisible();
    await screen.getByRole("button", { name: "Batal" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Slider" })).not.toBeVisible();
  },
);
