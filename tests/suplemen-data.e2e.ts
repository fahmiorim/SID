import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatPendudukStatistikUji,
  hapusPendudukStatistikUji,
  hapusSuplemenDariNama,
} from "./support/database";

/**
 * Katalog: OS-POP-007 — Data suplemen.
 *
 * Alur yang dibuktikan: definisi baru tampil setelah pencarian, keterangan
 * dapat diubah, penduduk ditambahkan dengan kolom isian dinamis, CSV mengekspor
 * kolom tersebut, impor CSV menambah sasaran kedua, lalu definisi dihapus.
 */
test(
  "suplemen: definisi, isian dinamis, impor, ekspor, dan hapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const nama = `Suplemen E2E ${cap}`;
    const dusun = `Dusun Suplemen E2E ${cap}`;
    const berkas = join("tests", "fixtures", `.tmp-suplemen-${cap}.csv`);
    let dataPertama: { id: number; regionId: number } | undefined;
    let dataKedua: { id: number; regionId: number } | undefined;

    try {
      const namaPertama = `Sasaran Suplemen A ${cap}`;
      const namaKedua = `Sasaran Suplemen B ${cap}`;
      const nikPertama = `3201${String(cap).slice(-8)}1001`;
      const nikKedua = `3201${String(cap).slice(-8)}1002`;

      dataPertama = await buatPendudukStatistikUji({
        nama: namaPertama,
        nik: nikPertama,
        dusun,
      });
      dataKedua = await buatPendudukStatistikUji({
        nama: namaKedua,
        nik: nikKedua,
        dusun,
        regionId: dataPertama.regionId,
      });
      const pertama = { id: dataPertama.id, nik: nikPertama, nama: namaPertama };
      const kedua = { id: dataKedua.id, nik: nikKedua, nama: namaKedua };
      const labelPertama = `${pertama.nama} — ${pertama.nik}`;
      const labelKedua = `${kedua.nama} — ${kedua.nik}`;

      await app.open("/penduduk/suplemen");
      await expect(screen.getByRole("heading", { name: "Data Suplemen" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Suplemen Baru" }).tap();
      const dialogTambah = screen.getByRole("dialog");
      await dialogTambah.getByPlaceholder("Contoh: Bantuan Subsidi").fill(nama);
      await dialogTambah.getByPlaceholder("Keterangan singkat...").fill("Keterangan awal E2E");
      await dialogTambah.getByRole("button", { name: "Simpan" }).tap();
      await expect(dialogTambah).not.toBeVisible({ timeout: 15_000 });

      await app.open(`/penduduk/suplemen?search=${encodeURIComponent(nama)}`);
      const baris = screen.getByRole("row").filter({ hasText: nama });
      await expect(baris).toBeVisible();
      await expect(baris).toContainText("Keterangan awal E2E");

      // Ubah keterangan lewat dialog baris yang sama.
      await baris.getByRole("button", { name: "Ubah" }).tap();
      const dialogUbah = screen.getByRole("dialog");
      await dialogUbah.getByPlaceholder("Keterangan singkat...").fill("Keterangan setelah ubah");
      await dialogUbah.getByRole("button", { name: "Simpan" }).tap();
      await expect(dialogUbah).not.toBeVisible({ timeout: 15_000 });
      await expect(baris).toContainText("Keterangan setelah ubah");

      // Detail kosong, lalu tambah penduduk dengan isian dinamis.
      await baris.getByRole("link", { name: "Detail" }).tap();
      await expect(browser.locator("h1")).toContainText(nama);
      await expect(screen.getByText("Terdata (0)")).toBeVisible();

      await screen.getByLabel("Penduduk").selectOption({ label: labelPertama });
      await screen.getByPlaceholder("Nama kolom (mis. Jenis Disabilitas)").fill("Jenis Bantuan");
      await screen.getByPlaceholder("Nilai").fill("Sembako");
      await screen.getByRole("button", { name: "Tambah terdata" }).tap();
      await expect(screen.getByText("Terdata ditambahkan.")).toBeVisible({ timeout: 15_000 });
      await expect(screen.getByText("Terdata (1)")).toBeVisible();
      await expect(screen.getByRole("columnheader", { name: "Jenis Bantuan" })).toBeVisible();
      await expect(screen.getByText("Sembako")).toBeVisible();

      // Ekspor CSV memuat sasaran dan kolom isian yang baru dibuat.
      const csv = await browser.evaluate(async () => {
        const res = await fetch(`${location.pathname}/ekspor`);
        return {
          status: res.status,
          type: res.headers.get("content-type") ?? "",
          body: await res.text(),
        };
      });
      expect(csv.status).toBe(200);
      expect(csv.type).toContain("text/csv");
      expect(csv.body).toContain(pertama.nama);
      expect(csv.body).toContain("Jenis Bantuan");
      expect(csv.body).toContain("Sembako");

      // Impor sasaran kedua; kolom tambahan menjadi isian dinamis.
      await writeFile(
        berkas,
        [
          ["NIK / No. KK", "Jenis Bantuan", "Catatan"].join(";"),
          [kedua.nik, "Pangan", "Impor E2E"].join(";"),
        ].join("\n"),
        "utf8",
      );

      await screen.getByRole("button", { name: "Impor", exact: true }).tap();
      const dialogImpor = screen.getByRole("dialog").filter({ hasText: "Impor Terdata" });
      await browser.locator('input[type="file"]').last().setInputFiles(berkas);
      await dialogImpor.getByRole("button", { name: "Impor", exact: true }).tap();
      await expect(dialogImpor.getByText(/Impor selesai: 1 ditambahkan; 0 dilewati/)).toBeVisible({
        timeout: 15_000,
      });
      await dialogImpor.getByRole("button", { name: "Tutup" }).tap();
      await expect(screen.getByText("Terdata (2)")).toBeVisible({ timeout: 15_000 });
      const barisKedua = screen.getByRole("row").filter({ hasText: labelKedua });
      await expect(barisKedua).toBeVisible();
      await expect(barisKedua.getByText("Pangan")).toBeVisible();

      // Cetak memakai tombol halaman; tombol harus tersedia bersama ekspor.
      await expect(screen.getByRole("button", { name: "Cetak" })).toBeVisible();

      // Hapus definisi lewat baris dan konfirmasi native.
      await app.open(`/penduduk/suplemen?search=${encodeURIComponent(nama)}`);
      const barisHapus = screen.getByRole("row").filter({ hasText: nama });
      const lepasDialog = await browser.onDialog("accept");
      await barisHapus.getByRole("button", { name: "Hapus" }).tap();
      await expect(barisHapus).toHaveCount(0, { timeout: 15_000 });
      await lepasDialog();

      await app.open(`/penduduk/suplemen?search=${encodeURIComponent(nama)}`);
      await expect(screen.getByText("Belum ada data suplemen.")).toBeVisible();
    } finally {
      await rm(berkas, { force: true }).catch(() => undefined);
      await hapusSuplemenDariNama(nama);
      if (dataKedua) await hapusPendudukStatistikUji(dataKedua);
      if (dataPertama) await hapusPendudukStatistikUji(dataPertama);
    }
  },
);
