import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusInventarisDariNama } from "./support/database";

/**
 * Katalog: OS-INV-001 — Inventaris & aset desa: tambah, ubah, dan hapus barang.
 */
test(
  "OS-INV-001 — inventaris: tambah, ubah lokasi, lalu hapus barang",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const nama = `Barang E2E ${Date.now()}`;

    try {
      await app.open("/inventaris");
      await expect(screen.getByRole("heading", { name: /Inventaris & Aset/i })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Barang" }).tap();
      await expect(screen.getByRole("dialog")).toBeVisible();
      await screen.getByLabel("Nama Barang").fill(nama);
      await screen.getByLabel("Jumlah").fill("2");
      await screen.getByLabel("Lokasi").fill("Gudang Desa");
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

      await expect(screen.getByText(nama)).toBeVisible();
      await expect(screen.getByText("Gudang Desa")).toBeVisible();

      await screen.getByRole("button", { name: `Ubah barang ${nama}` }).tap();
      await expect(screen.getByRole("dialog")).toBeVisible();
      await screen.getByLabel("Lokasi").fill("Balai Desa");
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText("Balai Desa")).toBeVisible();

      await screen.getByRole("button", { name: `Hapus barang ${nama}` }).tap();
      const konfirmasi = screen.getByRole("alertdialog");
      await expect(konfirmasi).toBeVisible();
      await konfirmasi.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText(nama)).not.toBeVisible({ timeout: 15_000 });
    } finally {
      await hapusInventarisDariNama(nama);
    }
  },
);

/**
 * Katalog: OS-BUM-001 — Buku administrasi umum (Bumindes) dapat dibuka operator.
 */
test(
  "OS-BUM-001 — bumindes: pintu masuk mengarah ke buku administrasi",
  { session: "admin", timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/bumindes");
    await expect(browser).toHaveURL("/bumindes/buku-administrasi");
    await expect(browser.locator("h1")).toBeVisible();
  },
);
