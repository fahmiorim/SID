import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  hapusItemSinkronisasiBukuPenduduk,
  hapusPendudukDariNik,
  ringkasanBukuPenduduk,
} from "./support/database";

/**
 * Katalog: OS-FIN-010 — buku induk, KTP/KK, mutasi, rekap, dan penduduk
 * sementara.
 *
 * Ringkasan buku harus benar-benar dibuat dari data penduduk, bukan hanya
 * memperbarui buku yang sudah berisi item. Test memakai satu penduduk tidak
 * tetap baru, lalu membandingkan teks buku dengan hitungan langsung dari tabel
 * sumber.
 */
test(
  "OS-FIN-010 — sinkronisasi penduduk mengisi B1–B5 dan tercetak",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const nik = `3201${String(cap).slice(-8)}${String(Math.floor(Math.random() * 10_000)).padStart(4, "0")}`;
    const nama = `Warga Sementara E2E ${cap}`;

    try {
      await hapusItemSinkronisasiBukuPenduduk();

      await app.open("/bumindes/buku-administrasi");
      await expect(screen.getByRole("heading", { name: "Buku Administrasi Desa" })).toBeVisible();
      await screen.getByRole("link", { name: /Buku Data Induk Penduduk/ }).tap();
      await expect(browser).toHaveURL(/\/bumindes\/buku-administrasi\/\d+$/);
      await expect(screen.getByText("Belum ada item pada buku ini.")).toBeVisible();

      // Penduduk tidak tetap baru menjadi sumber angka B1–B5.
      await app.open("/penduduk");
      await screen.getByRole("button", { name: "Tambah Penduduk" }).tap();
      await screen.getByLabel("NIK").fill(nik);
      await screen.getByLabel("Nama Lengkap").fill(nama);
      await screen.getByLabel("Jenis Kelamin").tap();
      await screen.getByRole("option", { name: "Perempuan" }).tap();
      await screen.getByLabel("Status Tempat Tinggal").tap();
      await screen.getByRole("option", { name: "Tidak Tetap" }).tap();
      await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Data penduduk ditambahkan.")).toBeVisible({
        timeout: 10_000,
      });

      const angka = await ringkasanBukuPenduduk();

      await app.open("/bumindes/buku-administrasi");
      await screen.getByRole("button", { name: "Sinkronisasi dari Penduduk" }).tap();
      await expect(screen.getByText("Sinkronisasi selesai untuk 5 buku")).toBeVisible({
        timeout: 10_000,
      });

      const buku = [
        {
          nama: /Buku Data Induk Penduduk/,
          teks: `Total ${angka.total} orang: ${angka.lakiLaki} laki-laki, ${angka.perempuan} perempuan.`,
        },
        {
          nama: /Buku KTP dan Kartu Keluarga/,
          teks: `${angka.withKtp} penduduk punya KTP, ${angka.withKk} KK terdaftar, ${angka.tanpaKk} tanpa KK.`,
        },
        {
          nama: /Buku Data Mutasi Penduduk/,
          teks: `${angka.lahir} lahir, ${angka.mati} mati, ${angka.pindahKeluar} pindah keluar, ${angka.datang} datang, ${angka.perubahan} perubahan data.`,
        },
        {
          nama: /Buku Rekapitulasi Jumlah Penduduk/,
          teks: `Total ${angka.total} orang: ${angka.lakiLaki} laki-laki, ${angka.perempuan} perempuan, ${angka.permanent} tetap, ${angka.temporary} sementara.`,
        },
        {
          nama: /Buku Penduduk Sementara/,
          teks: `${angka.temporary} penduduk sementara dari total ${angka.total} orang.`,
        },
      ];

      for (const item of buku) {
        await app.open("/bumindes/buku-administrasi");
        await screen.getByRole("link", { name: item.nama }).tap();
        await expect(screen.getByRole("row").filter({ hasText: item.teks })).toBeVisible();
      }

      // Buku mutasi resmi mencetak ringkasan yang sama.
      await app.open("/bumindes/buku-administrasi");
      await screen.getByRole("link", { name: /Buku Data Mutasi Penduduk/ }).tap();
      await expect(browser).toHaveURL(/\/bumindes\/buku-administrasi\/\d+$/);
      const url = await browser.url();
      await app.open(`${url}/cetak`);
      await expect(
        screen.getByRole("heading", { name: /Buku Data Mutasi Penduduk \(B3\)/ }),
      ).toBeVisible();
      await expect(screen.getByText(buku[2]!.teks)).toBeVisible();
    } finally {
      await hapusItemSinkronisasiBukuPenduduk();
      await hapusPendudukDariNik(nik);
    }
  },
);
