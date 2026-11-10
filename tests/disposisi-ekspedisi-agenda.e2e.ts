import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  bacaDisposisiTerakhirSuratMasuk,
  bacaEkspedisiTerakhirSuratKeluar,
  hapusSuratKeluarDariNomor,
  hapusSuratMasukDariNomor,
} from "./support/database";

/**
 * Katalog: OS-SUR-009 dan OS-SUR-010.
 *
 * Alur penuh dari UI (bukan smoke seperti sebelumnya):
 * - Surat masuk dicatat lewat dialog, ditemukan lewat pencarian, diberi
 *   disposisi, lalu halaman daftarnya dapat dicetak.
 * - Surat keluar dicatat, ditemukan lewat pencarian, dicatat ekspedisinya,
 *   dan halaman daftarnya dapat dicetak.
 *
 * Disposisi dan ekspedisi diverifikasi ulang dari database karena toast saja
 * hanya membuktikan aksi UI berjalan.
 *
 * OS-SUR-012 (buku agenda/ekspedisi) tidak dirujuk di sini: buku A6/A7 di
 * `/bumindes/sekretariat/agenda` membaca tabel manual `bumindes_agenda` yang
 * tidak diisi oleh surat masuk/keluar, dan log `letter_agenda_logs` belum punya
 * halaman. Gap itu dicatat di STATUS-MODUL, bukan ditutupi assertion lain.
 */
test(
  "surat masuk + disposisi dan surat keluar + ekspedisi lewat UI, lalu cetak daftar",
  { session: "admin", timeout: 240_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const nomorMasuk = `M-${cap}`;
    const nomorKeluar = `K-${cap}`;
    const instruksi = `Tindak lanjuti undangan ${cap}`;

    try {
      // --- OS-SUR-009: catat surat masuk lewat dialog ---
      await app.open("/persuratan/surat-masuk");
      await expect(screen.getByRole("heading", { name: "Surat Masuk" })).toBeVisible();
      await screen.getByRole("button", { name: "Catat Surat Masuk" }).tap();
      await expect(screen.getByRole("dialog", { name: "Catat Surat Masuk" })).toBeVisible();
      await screen.getByLabel("Nomor Surat").fill(nomorMasuk);
      await screen.getByLabel("Pengirim").fill(`Kecamatan Uji ${cap}`);
      await screen.getByLabel("Isi Singkat").fill("Undangan rapat koordinasi");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Surat masuk dicatat.")).toBeVisible({ timeout: 10_000 });

      // Pencarian menemukan surat dan menyaring yang tidak cocok.
      await app.open(`/persuratan/surat-masuk?q=${encodeURIComponent(nomorMasuk)}`);
      const barisMasuk = screen.getByRole("row").filter({ hasText: nomorMasuk });
      await expect(barisMasuk).toBeVisible();
      await expect(screen.getByText("Tidak ada surat yang cocok.")).toHaveCount(0);

      // Disposisi lewat menu aksi baris.
      await barisMasuk
        .getByRole("button", { name: new RegExp(`Aksi surat masuk ${nomorMasuk}`) })
        .tap();
      await screen.getByRole("menuitem", { name: "Disposisi" }).tap();
      await expect(
        screen.getByRole("alertdialog", { name: "Disposisi surat masuk" }),
      ).toBeVisible();
      await screen.getByLabel("Instruksi").fill(instruksi);
      await screen.getByLabel("Kepada (peran/pengguna)").fill("Sekretaris Desa");
      await screen.getByLabel("Batas waktu").fill("2026-11-20");
      await screen.getByRole("button", { name: "Simpan disposisi" }).tap();
      await expect(screen.getByText("Disposisi surat masuk ditambahkan.")).toBeVisible({
        timeout: 10_000,
      });

      expect(await bacaDisposisiTerakhirSuratMasuk(nomorMasuk)).toMatchObject({
        instruction: instruksi,
        toRole: "Sekretaris Desa",
        dueDate: "2026-11-20",
      });

      // Cetak daftar: tombol memanggil window.print, bukan hanya tampil.
      await browser.evaluate(() => {
        const target = window as unknown as { __cetak?: number };
        target.__cetak = 0;
        window.print = () => {
          target.__cetak = (target.__cetak ?? 0) + 1;
        };
      });
      await screen.getByRole("button", { name: "Cetak" }).tap();
      const cetakMasuk = await browser.evaluate(
        () => (window as unknown as { __cetak?: number }).__cetak ?? 0,
      );
      expect(cetakMasuk).toBe(1);

      // --- OS-SUR-010: catat surat keluar lewat dialog ---
      await app.open("/persuratan/surat-keluar");
      await expect(screen.getByRole("heading", { name: "Surat Keluar" })).toBeVisible();
      await screen.getByRole("button", { name: "Catat Surat Keluar" }).tap();
      await expect(screen.getByRole("dialog", { name: "Catat Surat Keluar" })).toBeVisible();
      await screen.getByLabel("Nomor Surat").fill(nomorKeluar);
      await screen.getByLabel("Tujuan").fill(`Dinas Uji ${cap}`);
      await screen.getByLabel("Isi Singkat").fill("Laporan hasil kegiatan");
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Surat keluar dicatat.")).toBeVisible({ timeout: 10_000 });

      await app.open(`/persuratan/surat-keluar?q=${encodeURIComponent(nomorKeluar)}`);
      const barisKeluar = screen.getByRole("row").filter({ hasText: nomorKeluar });
      await expect(barisKeluar).toBeVisible();

      // Ekspedisi lewat menu aksi baris.
      await barisKeluar
        .getByRole("button", { name: new RegExp(`Aksi surat keluar ${nomorKeluar}`) })
        .tap();
      await screen.getByRole("menuitem", { name: "Ekspedisi" }).tap();
      await expect(
        screen.getByRole("alertdialog", { name: "Catat ekspedisi surat keluar" }),
      ).toBeVisible();
      await screen.getByLabel("Tanggal kirim").fill("2026-11-10");
      await screen.getByLabel("Tujuan/Penerima").fill(`Dinas Uji ${cap}`);
      await screen.getByLabel("Cara kirim").fill("Kurir");
      await screen.getByRole("button", { name: "Simpan ekspedisi" }).tap();
      await expect(screen.getByText("Ekspedisi surat keluar dicatat.")).toBeVisible({
        timeout: 10_000,
      });

      expect(await bacaEkspedisiTerakhirSuratKeluar(nomorKeluar)).toMatchObject({
        sentDate: "2026-11-10",
        recipient: `Dinas Uji ${cap}`,
        deliveryMethod: "Kurir",
      });

      await browser.evaluate(() => {
        const target = window as unknown as { __cetak?: number };
        target.__cetak = 0;
        window.print = () => {
          target.__cetak = (target.__cetak ?? 0) + 1;
        };
      });
      await screen.getByRole("button", { name: "Cetak" }).tap();
      const cetakKeluar = await browser.evaluate(
        () => (window as unknown as { __cetak?: number }).__cetak ?? 0,
      );
      expect(cetakKeluar).toBe(1);
    } finally {
      await hapusSuratMasukDariNomor(nomorMasuk);
      await hapusSuratKeluarDariNomor(nomorKeluar);
    }
  },
);
