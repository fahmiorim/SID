import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusWilayahDariDusun } from "./support/database";

/**
 * Katalog: OS-WIL-001 — Wilayah administratif: CRUD dusun/RW/RT
 */
test(
  "wilayah: tambah dusun, cari, ubah, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const dusun = `Dusun Uji ${Date.now()}`;

    try {
      await app.open("/wilayah");
      await expect(browser.locator("h1")).toContainText("Wilayah");

      await screen.getByRole("button", { name: "Tambah Wilayah" }).tap();
      await screen.getByLabel("Dusun").fill(dusun);
      await screen.getByLabel("RW").fill("09");
      await screen.getByLabel("RT").fill("07");
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Data wilayah ditambahkan.")).toBeVisible();

      await screen.getByLabel("Cari wilayah").fill(dusun);
      await screen.getByRole("button", { name: "Cari" }).tap();
      const baris = screen.getByRole("row").filter({ hasText: dusun });
      await expect(baris).toBeVisible();
      await expect(baris).toContainText("09");
      await expect(baris).toContainText("07");

      await baris.getByRole("button", { name: /Aksi untuk/ }).tap();
      await screen.getByRole("menuitem", { name: "Ubah" }).tap();
      await screen.getByLabel("Urutan").fill("5");
      await screen.getByRole("button", { name: "Simpan perubahan" }).tap();
      await expect(screen.getByText("Data wilayah diperbarui.")).toBeVisible();

      await screen
        .getByRole("row")
        .filter({ hasText: dusun })
        .getByRole("button", {
          name: /Aksi untuk/,
        })
        .tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      await expect(screen.getByText("Hapus data wilayah?")).toBeVisible();
      await screen.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Data wilayah dihapus.")).toBeVisible();
    } finally {
      await hapusWilayahDariDusun(dusun);
    }
  },
);

/**
 * Katalog: OS-WIL-001 — rekap wilayah
 */
test(
  "wilayah: rekap menampilkan ringkasan dusun/RW/RT",
  { session: "admin", timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/wilayah/rekap");
    await expect(browser.locator("h1")).toContainText("Rekap Wilayah");
    await expect(browser.locator("table").first()).toBeVisible();
  },
);

/**
 * Katalog: OS-WIL-002 — referensi wilayah pada modul lain
 */
test(
  "referensi wilayah: jajak pendapat, kontak, dan pertanahan terbuka",
  { session: "admin", timeout: 60_000 },
  async ({ app, browser }) => {
    for (const [path, judul] of [
      ["/pendapat", "Pendapat Warga"],
      ["/hubung-warga/daftar-kontak", "Kontak"],
      ["/desa/pertanahan", "Pertanahan"],
    ] as const) {
      await app.open(path);
      await expect(browser.locator("h1")).toContainText(judul);
    }
  },
);
