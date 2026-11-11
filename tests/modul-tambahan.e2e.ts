import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  hapusBukuTamuDariNama,
  hapusKehadiranDariPerangkatTanggal,
  perangkatUntukKehadiranUji,
} from "./support/database";

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
 * Katalog: OS-MOD-003 — Catat kehadiran lewat UI, filter rekap, dan ekspor CSV.
 */
test(
  "rekap kehadiran: catat lewat UI, filter periode, dan unduh CSV",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const perangkat = await perangkatUntukKehadiranUji();
    const tanggal = "2099-12-15";

    try {
      await app.open("/kehadiran");
      await expect(screen.getByRole("heading", { name: "Kehadiran Perangkat" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Kehadiran" }).tap();
      const dialog = screen.getByRole("dialog");
      await dialog.getByLabel("Perangkat").tap();
      await screen.getByRole("option", { name: perangkat.nama }).tap();
      await dialog.getByLabel("Tanggal").fill(tanggal);
      await dialog.getByLabel("Jam Masuk").fill("08:15");
      await dialog.getByLabel("Jam Keluar").fill("16:05");
      await dialog.getByLabel("Status").tap();
      await screen.getByRole("option", { name: "Izin" }).tap();
      await dialog.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Kehadiran berhasil ditambahkan.")).toBeVisible({
        timeout: 15_000,
      });

      await app.open("/kehadiran");
      const barisKehadiran = screen
        .getByRole("row")
        .filter({ hasText: perangkat.nama })
        .filter({ hasText: tanggal });
      await expect(barisKehadiran).toBeVisible();
      await expect(barisKehadiran.getByText("08:15")).toBeVisible();
      await expect(barisKehadiran.getByText("16:05")).toBeVisible();
      await expect(barisKehadiran.getByText("izin", { exact: true })).toBeVisible();

      // Filter periode lewat form rekap, bukan URL langsung.
      await app.open("/kehadiran/rekap");
      await expect(screen.getByRole("heading", { name: /rekap kehadiran/i })).toBeVisible();
      await screen.getByLabel("Bulan").fill("12");
      await screen.getByLabel("Tahun").fill("2099");
      await screen.getByRole("button", { name: "Tampilkan" }).tap();
      await expect(browser).toHaveURL(/bulan=12/);
      await expect(browser).toHaveURL(/tahun=2099/);

      const barisRekap = screen.getByRole("row").filter({ hasText: perangkat.nama });
      await expect(barisRekap).toBeVisible();
      await expect(barisRekap.getByRole("cell").nth(2)).toHaveText("0");
      await expect(barisRekap.getByRole("cell").nth(3)).toHaveText("1");
      await expect(barisRekap.getByRole("cell").nth(4)).toHaveText("0");
      await expect(barisRekap.getByRole("cell").nth(5)).toHaveText("0");

      const csv = await browser.evaluate(async () => {
        const res = await fetch("/kehadiran/rekap/ekspor?bulan=12&tahun=2099");
        return {
          status: res.status,
          type: res.headers.get("content-type") ?? "",
          body: await res.text(),
        };
      });
      expect(csv.status).toBe(200);
      expect(csv.type).toContain("text/csv");
      expect(csv.body).toContain("Perangkat,Jabatan,Hadir,Izin,Sakit,Alpa");
      expect(csv.body).toContain(perangkat.nama);
      expect(csv.body).toContain("0,1,0,0");

      // Hapus catatan lewat dialog edit agar alur admin tetap utuh.
      await app.open("/kehadiran");
      const barisHapus = screen
        .getByRole("row")
        .filter({ hasText: perangkat.nama })
        .filter({ hasText: tanggal });
      await barisHapus.getByRole("button", { name: "Ubah" }).tap();
      const dialogEdit = screen.getByRole("dialog");
      await dialogEdit.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Kehadiran berhasil dihapus.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(barisHapus).toHaveCount(0);
    } finally {
      await hapusKehadiranDariPerangkatTanggal(perangkat.id, tanggal);
    }
  },
);
