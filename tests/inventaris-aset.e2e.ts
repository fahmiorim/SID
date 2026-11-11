import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatInventarisPublikUji,
  hapusInventarisDariNama,
  hapusInventarisUji,
  hapusKategoriInventarisDariNama,
} from "./support/database";

/**
 * Katalog: OS-FIN-007 — inventaris aset enam golongan, nilai, dan laporan.
 *
 * Kategori dibuat lewat dialog dengan golongan "Peralatan & Mesin", lalu barang
 * dibuat lewat dialog dan dirujuk ke kategori tersebut. Laporan yang difilter
 * dan neraca harus memakai kategori/nilai yang sama; kategori yang masih dipakai
 * barang tidak boleh dihapus.
 */
test(
  "OS-FIN-007 — kategori aset dipakai barang, tampil di laporan dan neraca",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const kode = `E2E-${String(cap).slice(-6)}`;
    const namaKategori = `Peralatan E2E ${cap}`;
    const namaBarang = `Komputer E2E ${cap}`;

    try {
      await app.open("/inventaris/kategori");
      await screen.getByRole("button", { name: "Tambah Kategori" }).tap();
      const dialogKategori = screen.getByRole("dialog", { name: "Tambah Kategori" });
      await expect(dialogKategori).toBeVisible();
      await dialogKategori.getByLabel("Kode").fill(kode);
      await dialogKategori.getByLabel("Nama Kategori").fill(namaKategori);
      await dialogKategori.getByRole("combobox", { name: "Golongan" }).tap();
      await expect(screen.getByRole("option", { name: "Peralatan & Mesin" })).toBeVisible();
      await screen.getByRole("option", { name: "Peralatan & Mesin" }).tap();
      await dialogKategori.getByLabel("Keterangan").fill("Kategori uji E2E");
      await dialogKategori.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Kategori disimpan.")).toBeVisible({ timeout: 10_000 });
      const barisKategori = screen.getByRole("row").filter({ hasText: namaKategori });
      await expect(barisKategori).toContainText("Peralatan & Mesin");

      // Barang baru memakai kategori tersebut dan menghitung nilai akhir.
      await app.open("/inventaris");
      await screen.getByRole("button", { name: "Tambah Barang" }).tap();
      const dialogBarang = screen.getByRole("dialog", { name: "Tambah Barang Inventaris" });
      await expect(dialogBarang).toBeVisible();
      await dialogBarang.getByLabel("Nama Barang").fill(namaBarang);
      await dialogBarang.getByRole("combobox", { name: "Kategori" }).tap();
      await screen.getByRole("option", { name: new RegExp(namaKategori) }).tap();
      await dialogBarang.getByLabel("Jumlah").fill("3");
      await dialogBarang.getByLabel("Satuan").fill("unit");
      await dialogBarang.getByLabel("Harga Satuan").fill("1500000");
      await dialogBarang.getByLabel("Lokasi").fill("Ruang TI E2E");
      await dialogBarang.getByRole("button", { name: "Tambah", exact: true }).tap();
      await expect(screen.getByText("Inventaris disimpan.")).toBeVisible({ timeout: 10_000 });

      await app.open(`/inventaris?q=${encodeURIComponent(namaBarang)}`);
      const barisBarang = screen.getByRole("row").filter({ hasText: namaBarang });
      await expect(barisBarang).toContainText(namaKategori);
      await expect(barisBarang).toContainText("3 unit");
      await expect(barisBarang).toContainText("Rp 4.500.000");

      // Kategori yang dipakai barang tidak boleh dihapus.
      await app.open("/inventaris/kategori");
      await screen
        .getByRole("button", { name: `Hapus kategori ${namaKategori}`, exact: true })
        .tap();
      const konfirmasi = screen.getByRole("alertdialog", { name: "Hapus kategori ini?" });
      await expect(konfirmasi).toBeVisible();
      await konfirmasi.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText(/masih dipakai oleh 1 barang/)).toBeVisible({
        timeout: 10_000,
      });
      await konfirmasi.getByRole("button", { name: "Batal" }).tap();

      // Laporan per kategori memakai angka yang sama dengan daftar barang.
      await app.open("/inventaris/laporan");
      await screen.getByLabel("Filter Kategori").selectOption({ label: namaKategori });
      await screen.getByRole("button", { name: "Terapkan" }).tap();
      const barisLaporan = screen.getByRole("row").filter({ hasText: namaKategori });
      await expect(barisLaporan).toContainText("3");
      await expect(barisLaporan).toContainText("Rp 4.500.000");
      const totalLaporan = screen.getByRole("row").filter({ hasText: /^Jumlah/ });
      await expect(totalLaporan).toContainText("Rp 4.500.000");

      // Neraca menampilkan kategori dan total kekayaan yang sama, lalu dapat dicetak.
      await app.open("/inventaris/neraca");
      const barisNeraca = screen.getByRole("row").filter({ hasText: namaKategori });
      await expect(barisNeraca).toContainText("Rp 4.500.000");
      await expect(screen.getByText("Total Kekayaan Aset")).toBeVisible();

      await browser.evaluate(() => {
        const target = window as unknown as { __cetak?: number };
        target.__cetak = 0;
        window.print = () => {
          target.__cetak = (target.__cetak ?? 0) + 1;
        };
      });
      await screen.getByRole("button", { name: "Cetak", exact: true }).tap();
      const cetak = await browser.evaluate(
        () => (window as unknown as { __cetak?: number }).__cetak ?? 0,
      );
      expect(cetak).toBe(1);
    } finally {
      await hapusInventarisDariNama(namaBarang);
      await hapusKategoriInventarisDariNama(namaKategori);
    }
  },
);

/**
 * Katalog: OS-FIN-008 — mutasi aset dengan persetujuan berjenjang.
 *
 * Barang disiapkan lewat fixture DB agar test berfokus pada alur mutasi.
 * Perubahan lokasi tidak boleh terlihat sebelum tahap akhir; setelah kepala desa
 * menyetujui, lokasi barang harus benar-benar berubah di daftar inventaris.
 */
test(
  "OS-FIN-008 — mutasi pindah lokasi diterapkan setelah tiga tahap persetujuan",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen }) => {
    const cap = Date.now();
    const namaBarang = `Proyektor Mutasi E2E ${cap}`;
    const namaKategori = `Mutasi E2E ${cap}`;
    const barang = await buatInventarisPublikUji({
      nama: namaBarang,
      kategori: namaKategori,
      jumlah: "5",
      nilai: "1000000",
      lokasi: "Gudang Lama E2E",
    });

    try {
      await app.open("/inventaris/mutasi");
      await screen.getByRole("combobox", { name: "Barang" }).tap();
      await screen.getByRole("option", { name: new RegExp(namaBarang) }).tap();
      await screen.getByLabel("Lokasi Baru").fill("Gudang Baru E2E");
      await screen.getByLabel("Alasan Mutasi").fill("Pindah ruang penyimpanan");
      await screen.getByRole("button", { name: "Ajukan Mutasi" }).tap();
      await expect(screen.getByText("Pengajuan mutasi dikirim.")).toBeVisible({
        timeout: 10_000,
      });

      let baris = screen.getByRole("row").filter({ hasText: namaBarang });
      await expect(baris).toContainText("Pindah Lokasi");
      await expect(baris).toContainText("Gudang Baru E2E");
      await expect(baris).toContainText("Menunggu Operator");

      // Operator.
      await baris.getByRole("button", { name: "Setujui Operator" }).tap();
      await expect(
        screen.getByText("Mutasi disetujui tahap operator. Menunggu tahap berikutnya."),
      ).toBeVisible({ timeout: 10_000 });

      // Sekretaris desa.
      baris = screen.getByRole("row").filter({ hasText: namaBarang });
      await baris.getByRole("button", { name: "Setujui Sekretaris Desa" }).tap();
      await expect(
        screen.getByText("Mutasi disetujui tahap sekdes. Menunggu tahap berikutnya."),
      ).toBeVisible({ timeout: 10_000 });

      // Kepala desa; di tahap ini perubahan aset diterapkan.
      baris = screen.getByRole("row").filter({ hasText: namaBarang });
      await baris.getByRole("button", { name: "Setujui Kepala Desa" }).tap();
      await expect(
        screen.getByText("Mutasi disetujui tahap kades dan perubahan aset telah diterapkan."),
      ).toBeVisible({ timeout: 10_000 });

      baris = screen.getByRole("row").filter({ hasText: namaBarang });
      await expect(baris).toContainText("Disetujui");

      await app.open(`/inventaris?q=${encodeURIComponent(namaBarang)}`);
      const barangTerbaru = screen.getByRole("row").filter({ hasText: namaBarang });
      await expect(barangTerbaru).toContainText("Gudang Baru E2E");
      await expect(barangTerbaru).not.toContainText("Gudang Lama E2E");
    } finally {
      await hapusInventarisUji({ id: barang.id, kategoriId: barang.kategoriId });
    }
  },
);
