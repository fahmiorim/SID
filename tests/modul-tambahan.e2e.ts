import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusBukuTamuDariNama } from "./support/database";

/**
 * Katalog: OS-MOD-002 — Buku tamu: tambah, ubah, lalu hapus.
 */
test(
  "buku tamu: tambah, ubah keperluan, dan hapus",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen }) => {
    const nama = `Tamu E2E ${Date.now()}`;

    try {
      await app.open("/buku-tamu");
      await expect(screen.getByRole("heading", { name: "Buku Tamu" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Tamu" }).tap();
      let dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Nama Tamu").fill(nama);
      await dialog.getByLabel("Instansi").fill("Dinas E2E");
      await dialog.getByLabel("Keperluan").fill("Koordinasi awal");
      await dialog.getByLabel("Jam Masuk").fill("08:30");
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });

      let baris = screen.getByRole("row").filter({ hasText: nama });
      await expect(baris).toBeVisible();
      await expect(baris.getByText("Dinas E2E")).toBeVisible();
      await expect(baris.getByText("08:30")).toBeVisible();

      await baris.getByRole("button", { name: "Ubah" }).tap();
      dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Keperluan").fill("Koordinasi lanjutan");
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });

      baris = screen.getByRole("row").filter({ hasText: nama });
      await expect(baris.getByText("Koordinasi lanjutan")).toBeVisible();

      await baris.getByRole("button", { name: "Ubah" }).tap();
      dialog = screen.getByRole("dialog");
      await dialog.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(dialog).not.toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText(nama)).toHaveCount(0);
    } finally {
      await hapusBukuTamuDariNama(nama);
    }
  },
);

/**
 * Katalog: OS-MOD-003 — Rekap kehadiran bulanan dan ekspor CSV.
 */
test(
  "rekap kehadiran: ringkasan status dan unduh CSV",
  { session: "admin" },
  async ({ app, screen, browser }) => {
    await app.open("/kehadiran/rekap");
    await expect(screen.getByRole("heading", { name: /rekap kehadiran/i })).toBeVisible();
    await expect(screen.getByText("Total per Status")).toBeVisible();
    await expect(screen.getByText("Hadir", { exact: true })).toBeVisible();

    const hasil = await browser.evaluate(async () => {
      const res = await fetch("/kehadiran/rekap/ekspor");
      return { contentType: res.headers.get("content-type"), body: await res.text() };
    });
    expect(hasil.contentType).toContain("text/csv");
    expect(hasil.body).toContain("Perangkat");
  },
);
