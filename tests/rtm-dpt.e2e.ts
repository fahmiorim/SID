import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusRtmDariBdt } from "./support/database";

function namaUnik(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
}

/**
 * Katalog: OS-POP-004 — Rumah Tangga (RTM): CRUD, anggota, laporan
 */
test(
  "rumah tangga: tambah, cari, ubah, tautkan anggota, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const alamat = namaUnik("Alamat RTM");
    const bdt = `9${String(Date.now()).slice(-6)}`;

    try {
      await app.open("/rumah-tangga");
      await expect(browser.locator("h1")).toContainText("Rumah Tangga");

      // --- Tambah ----------------------------------------------------------
      await screen.getByRole("button", { name: "Tambah Rumah Tangga" }).tap();
      await screen.getByLabel("Alamat").fill(alamat);
      await screen.getByLabel("Nomor BDT").fill(bdt);
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Rumah Tangga ditambahkan.")).toBeVisible();

      // --- Cari ------------------------------------------------------------
      await screen.getByLabel("Cari rumah tangga").fill(alamat);
      await screen.getByRole("button", { name: "Cari" }).tap();
      const baris = screen.getByRole("row").filter({ hasText: bdt });
      await expect(baris).toBeVisible();

      // --- Ubah ------------------------------------------------------------
      await baris.getByRole("button", { name: /Aksi untuk RTM/ }).tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await screen.getByLabel("Alamat").fill(`${alamat} Baru`);
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Rumah Tangga diperbarui.")).toBeVisible();

      // --- Anggota: tautkan lalu keluarkan ---------------------------------
      await app.open(`/rumah-tangga?q=${encodeURIComponent(alamat)}`);
      await screen
        .getByRole("row")
        .filter({ hasText: bdt })
        .getByRole("button", {
          name: /Aksi untuk RTM/,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Anggota" }).tap();
      await expect(screen.getByText(/Anggota RTM/)).toBeVisible();

      await screen.getByLabel("Penduduk").tap();
      await screen.getByRole("option").first().tap();
      await screen.getByRole("button", { name: "Tautkan" }).tap();
      await expect(screen.getByText("Anggota rumah tangga disimpan.")).toBeVisible();

      await screen.getByRole("button", { name: /^Keluarkan / }).tap();
      await expect(screen.getByText("Anggota dikeluarkan dari rumah tangga.")).toBeVisible();
      await screen.getByRole("button", { name: "Close" }).first().tap();

      // --- Hapus -----------------------------------------------------------
      await app.open(`/rumah-tangga?q=${encodeURIComponent(alamat)}`);
      await screen
        .getByRole("row")
        .filter({ hasText: bdt })
        .getByRole("button", {
          name: /Aksi untuk RTM/,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      await expect(screen.getByText("Hapus rumah tangga ini?")).toBeVisible();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Rumah Tangga dihapus.")).toBeVisible();

      await app.open(`/rumah-tangga?q=${encodeURIComponent(alamat)}`);
      await expect(
        screen.getByText("Tidak ada rumah tangga yang cocok dengan filter."),
      ).toBeVisible();
    } finally {
      await hapusRtmDariBdt(bdt);
    }
  },
);

/**
 * Katalog: OS-POP-004 — laporan rumah tangga
 */
test(
  "rumah tangga: laporan memuat rekap kelas sosial",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/rumah-tangga/laporan");
    await expect(browser.locator("h1")).toContainText("Laporan");
    await expect(screen.getByText(/Rumah Tangga/i).first()).toBeVisible();
  },
);
