import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatPendudukStatistikUji,
  hapusPendudukStatistikUji,
  hapusRentangUmurDariNama,
} from "./support/database";

/**
 * Katalog: OS-POP-010 — Statistik penduduk dan rentang umur.
 *
 * Dua penduduk dibuat pada dusun unik dengan umur dan jenis kelamin berbeda.
 * E2E membuktikan filter dusun/umur mengubah angka tabel, kategori rentan
 * menghitung lansia, ekspor membawa filter yang sama, laporan kependudukan
 * tetap dapat dibuka, lalu rentang umur kustom dibuat, diubah, dan dihapus.
 */
test(
  "statistik penduduk: filter, rentan, ekspor, laporan, dan rentang umur",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const dusun = `Dusun Statistik E2E ${cap}`;
    const tua = await buatPendudukStatistikUji({
      nama: `Lansia Statistik E2E ${cap}`,
      nik: `3201${String(cap).slice(-8)}0001`,
      dusun,
      rw: "09",
      rt: "08",
      gender: "male",
      birthDate: "1955-03-10",
    });
    const muda = await buatPendudukStatistikUji({
      nama: `Pemuda Statistik E2E ${cap}`,
      nik: `3201${String(cap).slice(-8)}0002`,
      dusun,
      rw: "09",
      rt: "08",
      gender: "female",
      birthDate: "2000-06-15",
      regionId: tua.regionId,
    });
    const namaRentang = `Rentang E2E ${cap}`;
    const namaRentangBaru = `${namaRentang} Diubah`;

    try {
      // 1. Filter dusun: angka tepat dua penduduk, satu laki-laki dan satu perempuan.
      await app.open(`/statistik/penduduk?dusun=${encodeURIComponent(dusun)}`);
      await expect(screen.getByRole("heading", { name: "Statistik Penduduk" })).toBeVisible();

      const barisLaki = screen.getByRole("row").filter({ hasText: "Laki-laki" });
      const barisPerempuan = screen.getByRole("row").filter({ hasText: "Perempuan" });
      const barisTotal = screen.getByRole("row").filter({ hasText: "Total" });

      await expect(barisLaki.getByRole("cell").nth(1)).toHaveText("1");
      await expect(barisLaki.getByRole("cell").nth(2)).toHaveText("1");
      await expect(barisPerempuan.getByRole("cell").nth(1)).toHaveText("1");
      await expect(barisPerempuan.getByRole("cell").nth(3)).toHaveText("1");
      await expect(barisTotal.getByRole("cell").nth(1)).toHaveText("2");

      // 2. Filter umur 20–30 hanya menyisakan penduduk perempuan.
      await screen.getByLabel("Umur minimal").fill("20");
      await screen.getByLabel("Umur maksimal").fill("30");
      await screen.getByRole("button", { name: "Tampilkan" }).tap();
      await expect(browser).toHaveURL(/umurMin=20/);
      await expect(browser).toHaveURL(/umurMax=30/);

      await expect(
        screen.getByRole("row").filter({ hasText: "Laki-laki" }).getByRole("cell").nth(1),
      ).toHaveText("0");
      await expect(
        screen.getByRole("row").filter({ hasText: "Perempuan" }).getByRole("cell").nth(1),
      ).toHaveText("1");
      await expect(
        screen.getByRole("row").filter({ hasText: "Total" }).getByRole("cell").nth(1),
      ).toHaveText("1");

      // 3. Tautan ekspor membawa dusun dan rentang umur yang sedang aktif.
      await expect(screen.getByRole("link", { name: "Ekspor CSV" })).toHaveAttribute(
        "href",
        /dusun=Dusun\+Statistik\+E2E/,
      );
      await expect(screen.getByRole("link", { name: "Ekspor CSV" })).toHaveAttribute(
        "href",
        /umurMin=20/,
      );
      await expect(screen.getByRole("link", { name: "Ekspor PDF" })).toHaveAttribute(
        "href",
        /umurMax=30/,
      );

      const unduhan = await browser.evaluate(async (kodeDusun: string) => {
        const csv = await fetch(
          `/statistik/penduduk/ekspor?dusun=${encodeURIComponent(kodeDusun)}&umurMin=20&umurMax=30`,
        );
        const pdf = await fetch("/statistik/penduduk/ekspor/pdf?umurMin=20&umurMax=30");
        return {
          csv: { status: csv.status, type: csv.headers.get("content-type") ?? "" },
          pdf: { status: pdf.status, type: pdf.headers.get("content-type") ?? "" },
        };
      }, dusun);
      expect(unduhan.csv.status).toBe(200);
      expect(unduhan.csv.type).toContain("text/csv");
      expect(unduhan.pdf.status).toBe(200);
      expect(unduhan.pdf.type).toContain("application/pdf");

      // 4. Kategori rentan menghitung lansia pada dusun yang sama.
      await app.open(`/statistik/penduduk?kind=rentan&dusun=${encodeURIComponent(dusun)}`);
      const barisLansia = screen.getByRole("row").filter({ hasText: /Lansia/ });
      await expect(barisLansia).toBeVisible();
      await expect(barisLansia.getByRole("cell").nth(1)).toHaveText("1");

      // 5. Laporan kependudukan tetap tersedia dengan tautan ekspornya.
      await app.open("/penduduk/laporan?jenis=umur");
      await expect(screen.getByRole("heading", { name: "Laporan Kependudukan" })).toBeVisible();
      await expect(screen.getByRole("link", { name: "Ekspor CSV" })).toHaveAttribute(
        "href",
        /\/penduduk\/laporan\/ekspor\?jenis=umur/,
      );

      // 6. Rentang umur kustom: tambah, ubah, lalu hapus lewat UI.
      await app.open("/statistik/rentang-umur");
      await expect(screen.getByRole("heading", { name: "Rentang Umur" })).toBeVisible();

      await screen.getByRole("button", { name: "Tambah Rentang" }).tap();
      const dialogTambah = screen.getByRole("dialog");
      await dialogTambah.getByLabel("Nama Rentang").fill(namaRentang);
      await dialogTambah.getByLabel("Batas Bawah").fill("200");
      await dialogTambah.getByLabel("Batas Atas (kosong = tanpa batas)").fill("300");
      await dialogTambah.getByRole("button", { name: "Simpan" }).tap();
      await expect(screen.getByText("Rentang umur berhasil ditambahkan.")).toBeVisible({
        timeout: 15_000,
      });

      const barisRentang = screen.getByRole("row").filter({ hasText: namaRentang });
      await expect(barisRentang).toBeVisible();
      await expect(barisRentang.getByRole("cell").nth(1)).toHaveText("200");
      await expect(barisRentang.getByRole("cell").nth(2)).toHaveText("300");

      await screen.getByRole("button", { name: `Ubah rentang ${namaRentang}` }).tap();
      const dialogUbah = screen.getByRole("dialog");
      await dialogUbah.getByLabel("Nama Rentang").fill(namaRentangBaru);
      await dialogUbah.getByRole("button", { name: "Simpan" }).tap();
      await expect(screen.getByText("Rentang umur berhasil diubah.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(screen.getByRole("row").filter({ hasText: namaRentangBaru })).toBeVisible();

      await screen.getByRole("button", { name: `Hapus rentang ${namaRentangBaru}` }).tap();
      await expect(screen.getByText("Rentang umur berhasil dihapus.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(screen.getByRole("row").filter({ hasText: namaRentangBaru })).toHaveCount(0);
    } finally {
      await hapusRentangUmurDariNama(namaRentang);
      await hapusRentangUmurDariNama(namaRentangBaru);
      await hapusPendudukStatistikUji(tua);
      await hapusPendudukStatistikUji(muda);
    }
  },
);
