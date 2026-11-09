import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusProyekDariJudul } from "./support/database";

/**
 * Katalog: OS-GOV-009 — Pembangunan: CRUD proyek + buku pembangunan + ekspor CSV
 */
test(
  "pembangunan: tambah proyek, ubah progres, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const judul = `Proyek Uji ${Date.now()}`;

    try {
      await app.open("/pembangunan");
      await expect(browser.locator("h1")).toContainText("Pembangunan");

      await screen.getByRole("button", { name: "Tambah Proyek" }).tap();
      await screen.getByLabel("Judul Proyek").fill(judul);
      await screen.getByLabel("Tahun Anggaran").fill("2099");
      await screen.getByLabel("Anggaran (Rp)").fill("150000000");
      await screen.getByLabel("Lokasi").fill("Dusun Uji");
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Proyek pembangunan ditambahkan.")).toBeVisible();

      // Proyek baru langsung tampil pada halaman publik dan bisa difilter tahun.
      await app.open("/desa/pembangunan?tahun=2099");
      await expect(browser.locator("h1")).toContainText("Pembangunan Desa");
      await expect(screen.getByText(judul)).toBeVisible();
      await expect(screen.getByLabel("Tahun anggaran")).toHaveValue("2099");

      await app.open("/pembangunan");
      await screen.getByLabel("Cari proyek pembangunan").fill(judul);
      await screen.getByRole("button", { name: "Terapkan" }).tap();
      const baris = screen.getByRole("row").filter({ hasText: judul });
      await expect(baris).toBeVisible();

      // --- Buku pembangunan ------------------------------------------------
      await app.open("/pembangunan/buku?tahun=2099");
      await expect(screen.getByRole("heading", { name: /buku pembangunan/i })).toBeVisible();
      await expect(screen.getByText(judul)).toBeVisible();
      await expect(screen.getByRole("link", { name: "Semua tahun" })).toHaveAttribute(
        "href",
        "/pembangunan/buku",
      );
      await expect(screen.getByRole("link", { name: /Ekspor CSV/ })).toHaveAttribute(
        "href",
        /\/pembangunan\/buku\/ekspor\?tahun=2099/,
      );

      // --- Rincian & ubah --------------------------------------------------
      await app.open(`/pembangunan?q=${encodeURIComponent(judul)}`);
      await screen
        .getByRole("row")
        .filter({ hasText: judul })
        .getByRole("button", {
          name: `Aksi untuk proyek ${judul}`,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Rincian" }).tap();
      await expect(browser).toHaveURL(/\/pembangunan\/\d+/);
      await expect(browser.locator("h1")).toContainText(judul);

      await app.open(`/pembangunan?q=${encodeURIComponent(judul)}`);
      await screen
        .getByRole("row")
        .filter({ hasText: judul })
        .getByRole("button", {
          name: `Aksi untuk proyek ${judul}`,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await screen.getByLabel("Progres Fisik (%)").fill("40");
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Proyek pembangunan diperbarui.")).toBeVisible();

      // --- Hapus -----------------------------------------------------------
      await screen
        .getByRole("row")
        .filter({ hasText: judul })
        .getByRole("button", {
          name: `Aksi untuk proyek ${judul}`,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      await expect(screen.getByText("Hapus proyek ini?")).toBeVisible();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Proyek pembangunan dihapus.")).toBeVisible();
    } finally {
      await hapusProyekDariJudul(judul);
    }
  },
);
