import { mkdtemp, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  bacaDisposisiTerakhirSuratMasuk,
  bacaEkspedisiTerakhirSuratKeluar,
  bacaLampiranDisposisiTerakhir,
  bacaPengaturanLampiranUji,
  hapusSuratKeluarDariNomor,
  hapusSuratMasukDariNomor,
  pulihkanPengaturanLampiranUji,
  setelBatasUkuranLampiranUji,
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
 * OS-SUR-012 diuji terpisah di `agenda-log-surat.e2e.ts`: buku A6/A7 membaca
 * surat masuk/keluar dan halaman log menampilkan disposisi/ekspedisi.
 */
test(
  "surat masuk + disposisi dan surat keluar + ekspedisi lewat UI, lalu cetak daftar",
  { session: "admin", timeout: 240_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const nomorMasuk = `M-${cap}`;
    const nomorKeluar = `K-${cap}`;
    const instruksi = `Tindak lanjuti undangan ${cap}`;
    const pengaturanSurat = await bacaPengaturanLampiranUji("surat");
    // Batas 1 MB menjaga body Server Action tetap di bawah batas 10 MB Next.js.
    await setelBatasUkuranLampiranUji("surat", 1024 * 1024);
    const folderBerkas = await mkdtemp(path.join(tmpdir(), "sid-e2e-lampiran-"));
    const berkasBesar = path.join(folderBerkas, "berkas-besar.pdf");
    await writeFile(berkasBesar, Buffer.alloc(2 * 1024 * 1024));
    let jalurLampiran: string | null = null;

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

      // MIME yang tidak didukung ditolak sebelum disposisi tersimpan.
      const inputLampiran = browser.locator('input[type="file"]');
      await inputLampiran.setInputFiles("tests/fixtures/jahat.html");
      await screen.getByRole("button", { name: "Simpan disposisi" }).tap();
      await expect(screen.getByText(/Tipe file tidak didukung/).first()).toBeVisible({
        timeout: 15_000,
      });

      // Tutup dan buka lagi agar input berkas kembali kosong.
      await screen.getByRole("button", { name: "Batal" }).tap();
      await barisMasuk
        .getByRole("button", { name: new RegExp(`Aksi surat masuk ${nomorMasuk}`) })
        .tap();
      await screen.getByRole("menuitem", { name: "Disposisi" }).tap();
      await screen.getByLabel("Instruksi").fill(instruksi);
      await screen.getByLabel("Kepada (peran/pengguna)").fill("Sekretaris Desa");
      await screen.getByLabel("Batas waktu").fill("2026-11-20");

      // Berkas melebihi batas ukuran juga ditolak sebelum disposisi tersimpan.
      await browser.locator('input[type="file"]').setInputFiles(berkasBesar);
      await screen.getByRole("button", { name: "Simpan disposisi" }).tap();
      await expect(screen.getByText(/Ukuran file maksimal \d+ MB\./).first()).toBeVisible({
        timeout: 15_000,
      });

      // Buka ulang dengan form bersih, lalu simpan tanpa lampiran.
      await screen.getByRole("button", { name: "Batal" }).tap();
      await barisMasuk
        .getByRole("button", { name: new RegExp(`Aksi surat masuk ${nomorMasuk}`) })
        .tap();
      await screen.getByRole("menuitem", { name: "Disposisi" }).tap();
      await screen.getByLabel("Instruksi").fill(instruksi);
      await screen.getByLabel("Kepada (peran/pengguna)").fill("Sekretaris Desa");
      await screen.getByLabel("Batas waktu").fill("2026-11-20");
      // Nama berkas jahat harus dibersihkan sebelum menjadi jalur di disk;
      // ekstensi tetap ditentukan MIME, bukan nama kiriman.
      await browser.evaluate(() => {
        const input = document.querySelector<HTMLInputElement>('input[type="file"]');
        if (!input) throw new Error("Input lampiran tidak ditemukan.");
        const transfer = new DataTransfer();
        transfer.items.add(
          new File(["%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n"], "../../../laporan.php.pdf", {
            type: "application/pdf",
          }),
        );
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      await screen.getByRole("button", { name: "Simpan disposisi" }).tap();
      await expect(screen.getByText("Disposisi surat masuk ditambahkan.")).toBeVisible({
        timeout: 10_000,
      });

      expect(await bacaDisposisiTerakhirSuratMasuk(nomorMasuk)).toMatchObject({
        instruction: instruksi,
        toRole: "Sekretaris Desa",
        dueDate: "2026-11-20",
      });

      const lampiran = await bacaLampiranDisposisiTerakhir(nomorMasuk);
      expect(lampiran).toHaveLength(1);
      jalurLampiran = lampiran[0].path;
      expect(jalurLampiran).not.toContain("..");
      expect(jalurLampiran).not.toContain(".php");
      expect(jalurLampiran).toMatch(/^\d+\/surat\/\d+-laporan-php\.pdf$/);

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
      if (jalurLampiran) {
        await unlink(path.join(process.cwd(), "storage", "media", jalurLampiran)).catch(() => {});
      }
      await rm(folderBerkas, { recursive: true, force: true });
      await pulihkanPengaturanLampiranUji("surat", pengaturanSurat);
    }
  },
);
