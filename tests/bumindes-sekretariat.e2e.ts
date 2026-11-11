import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatAgendaBukuUji,
  buatAparatUji,
  buatPeraturanUji,
  hapusAgendaBukuDariNomor,
  hapusAparatDariNama,
  hapusPeraturanDariNomor,
} from "./support/database";

/**
 * Katalog: OS-FIN-013 — buku agenda, lembaran desa, pengurus, dan dokumen
 * sekretariat.
 *
 * Tiga buku sekretariat diuji dari data sumber resmi sampai keluaran petugas:
 * daftar, halaman cetak ber-kop, dan CSV. Agenda masuk/keluar juga dipisah agar
 * ekspedisi tidak tercampur dengan buku agenda.
 */
test(
  "OS-FIN-013 — peraturan, aparat, agenda, dan ekspedisi tampil di buku resmi",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const nomorPeraturan = `PERDES-${cap}`;
    const tentang = `Ketertiban Umum E2E ${cap}`;
    const namaAparat = `Aparat Buku E2E ${cap}`;
    const nomorMasuk = `M-${cap}`;
    const nomorKeluar = `K-${cap}`;
    const perihalMasuk = `Undangan Musyawarah E2E ${cap}`;
    const perihalKeluar = `Laporan Kegiatan E2E ${cap}`;

    try {
      await buatPeraturanUji({
        nomor: nomorPeraturan,
        jenis: "peraturan_desa",
        tentang,
      });
      await buatAparatUji({
        nama: namaAparat,
        nip: `NIP-${cap}`,
        jabatan: "Kaur Umum",
        pendidikan: "S1",
      });
      await buatAgendaBukuUji({
        jenis: "masuk",
        nomorSurat: nomorMasuk,
        asalTujuan: "Kecamatan Uji",
        perihal: perihalMasuk,
      });
      await buatAgendaBukuUji({
        jenis: "keluar",
        nomorSurat: nomorKeluar,
        asalTujuan: "Camat Uji",
        perihal: perihalKeluar,
      });

      await app.open("/bumindes/sekretariat");
      await expect(screen.getByRole("heading", { name: "Buku Sekretariat Desa" })).toBeVisible();
      await expect(screen.getByRole("link", { name: "Peraturan & Keputusan" })).toBeVisible();
      await expect(screen.getByRole("link", { name: "Data Aparat" })).toBeVisible();
      await expect(screen.getByRole("link", { name: "Agenda Surat" })).toBeVisible();

      await app.open("/bumindes/sekretariat/peraturan");
      const barisPeraturan = screen.getByRole("row").filter({ hasText: nomorPeraturan });
      await expect(barisPeraturan).toBeVisible();
      await expect(barisPeraturan).toContainText("Peraturan Desa");
      await expect(barisPeraturan).toContainText(tentang);
      await expect(barisPeraturan).toContainText("2026");
      await screen.getByRole("link", { name: "Cetak", exact: true }).tap();
      await expect(
        screen.getByRole("heading", {
          name: /BUKU PERATURAN DESA DAN KEPUTUSAN KEPALA DESA \(A1\)/i,
        }),
      ).toBeVisible();
      await expect(screen.getByText(tentang)).toBeVisible();

      await app.open("/bumindes/sekretariat/aparat");
      const barisAparat = screen.getByRole("row").filter({ hasText: namaAparat });
      await expect(barisAparat).toBeVisible();
      await expect(barisAparat).toContainText("Kaur Umum");
      await expect(barisAparat).toContainText("S1");
      await screen.getByRole("link", { name: "Cetak", exact: true }).tap();
      await expect(
        screen.getByRole("heading", { name: /BUKU APARAT PEMERINTAH DESA \(A4\)/i }),
      ).toBeVisible();
      await expect(screen.getByText(namaAparat)).toBeVisible();

      await app.open("/bumindes/sekretariat/agenda");
      await expect(
        screen.getByRole("heading", { name: "Buku Agenda dan Ekspedisi" }),
      ).toBeVisible();
      const barisMasuk = screen.getByRole("row").filter({ hasText: nomorMasuk });
      await expect(barisMasuk).toBeVisible();
      await expect(barisMasuk).toContainText("Surat Masuk");
      await expect(barisMasuk).toContainText(perihalMasuk);
      const barisKeluar = screen.getByRole("row").filter({ hasText: nomorKeluar });
      await expect(barisKeluar).toBeVisible();
      await expect(barisKeluar).toContainText("Surat Keluar");
      await expect(barisKeluar).toContainText(perihalKeluar);

      await screen.getByRole("link", { name: "Cetak Agenda" }).tap();
      await expect(screen.getByRole("heading", { name: /BUKU AGENDA \(A6\)/i })).toBeVisible();
      await expect(screen.getByText(perihalMasuk)).toBeVisible();
      await expect(screen.getByText(perihalKeluar)).not.toBeVisible();

      await app.open("/bumindes/sekretariat/agenda/cetak?jenis=keluar");
      await expect(screen.getByRole("heading", { name: /BUKU EKSPEDISI \(A7\)/i })).toBeVisible();
      await expect(screen.getByText(perihalKeluar)).toBeVisible();
      await expect(screen.getByText(perihalMasuk)).not.toBeVisible();

      for (const jalur of [
        "/bumindes/sekretariat/peraturan/ekspor",
        "/bumindes/sekretariat/aparat/ekspor",
        "/bumindes/sekretariat/agenda/ekspor",
        "/bumindes/sekretariat/agenda/ekspor?jenis=keluar",
      ]) {
        const csv = await browser.evaluate(async (url) => {
          const res = await fetch(url);
          return {
            status: res.status,
            tipe: res.headers.get("content-type"),
            teks: await res.text(),
          };
        }, jalur);
        expect(csv.status, jalur).toBe(200);
        expect(csv.tipe, jalur).toContain("text/csv");
      }

      const csvPeraturan = await browser.evaluate(async () => {
        const res = await fetch("/bumindes/sekretariat/peraturan/ekspor");
        return await res.text();
      });
      expect(csvPeraturan).toContain(nomorPeraturan);
      expect(csvPeraturan).toContain(tentang);

      const csvAgenda = await browser.evaluate(async () => {
        const res = await fetch("/bumindes/sekretariat/agenda/ekspor");
        return await res.text();
      });
      expect(csvAgenda).toContain(nomorMasuk);
      expect(csvAgenda).toContain(perihalMasuk);

      const csvEkspedisi = await browser.evaluate(async () => {
        const res = await fetch("/bumindes/sekretariat/agenda/ekspor?jenis=keluar");
        return await res.text();
      });
      expect(csvEkspedisi).toContain(nomorKeluar);
      expect(csvEkspedisi).toContain(perihalKeluar);
      expect(csvEkspedisi).not.toContain(perihalMasuk);
    } finally {
      await hapusPeraturanDariNomor(nomorPeraturan);
      await hapusAparatDariNama(namaAparat);
      await hapusAgendaBukuDariNomor(nomorMasuk);
      await hapusAgendaBukuDariNomor(nomorKeluar);
    }
  },
);
