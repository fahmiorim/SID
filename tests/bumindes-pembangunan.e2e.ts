import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatBukuPembangunanUji,
  buatKaderPembangunanUji,
  hapusBukuPembangunanDariNama,
  hapusKaderPembangunanDariNama,
} from "./support/database";

/**
 * Katalog: OS-FIN-012 — buku rencana/kegiatan/hasil pembangunan dan kader.
 *
 * Tabel buku pembangunan berbeda dari proyek publik, sehingga barisnya
 * disiapkan langsung sebagai data sumber. Test membuktikan kegiatan dan kader
 * tampil di daftar, halaman cetak ber-kop, serta CSV resmi.
 */
test(
  "OS-FIN-012 — kegiatan dan kader tampil di buku pembangunan, cetak, dan CSV",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const tahun = 2097;
    const namaKegiatan = `Kegiatan Buku E2E ${cap}`;
    const lokasi = `Dusun Pembangunan ${cap}`;
    const namaKader = `Kader Buku E2E ${cap}`;
    const bidang = `Pemberdayaan ${cap}`;

    try {
      await buatBukuPembangunanUji({
        namaKegiatan,
        tahun,
        lokasi,
        sumberDana: "Dana Desa",
        biaya: "225000000.00",
        status: "selesai",
      });
      await buatKaderPembangunanUji({
        nama: namaKader,
        jabatan: "Ketua",
        bidang,
        alamat: lokasi,
        noHp: "081234567890",
      });

      await app.open("/bumindes/pembangunan");
      await expect(screen.getByRole("heading", { name: "Buku Pembangunan" })).toBeVisible();

      const barisKegiatan = screen.getByRole("row").filter({ hasText: namaKegiatan });
      await expect(barisKegiatan).toBeVisible();
      await expect(barisKegiatan).toContainText(String(tahun));
      await expect(barisKegiatan).toContainText(lokasi);
      await expect(barisKegiatan).toContainText("Dana Desa");
      await expect(barisKegiatan).toContainText("225000000.00");
      await expect(barisKegiatan).toContainText("selesai");
      await expect(screen.getByRole("row").filter({ hasText: namaKader })).toBeVisible();

      await screen.getByRole("link", { name: "Cetak Buku" }).tap();
      await expect(screen.getByRole("heading", { name: /BUKU PEMBANGUNAN \(P1\)/i })).toBeVisible();
      await expect(screen.getByText(namaKegiatan)).toBeVisible();
      await expect(screen.getByText(lokasi)).toBeVisible();

      await app.open("/bumindes/pembangunan/kader");
      await expect(screen.getByRole("heading", { name: "Buku Kader Pembangunan" })).toBeVisible();
      const barisKader = screen.getByRole("row").filter({ hasText: namaKader });
      await expect(barisKader).toBeVisible();
      await expect(barisKader).toContainText(bidang);
      await expect(barisKader).toContainText("081234567890");

      await screen.getByRole("link", { name: "Cetak", exact: true }).tap();
      await expect(
        screen.getByRole("heading", { name: /BUKU KADER PEMBANGUNAN \(K1\)/i }),
      ).toBeVisible();
      await expect(screen.getByText(namaKader)).toBeVisible();

      const csvPembangunan = await browser.evaluate(async () => {
        const res = await fetch("/bumindes/pembangunan/ekspor?tahun=2097");
        return {
          status: res.status,
          tipe: res.headers.get("content-type"),
          teks: await res.text(),
        };
      });
      expect(csvPembangunan.status).toBe(200);
      expect(csvPembangunan.tipe).toContain("text/csv");
      expect(csvPembangunan.teks).toContain(namaKegiatan);
      expect(csvPembangunan.teks).toContain("Dana Desa");

      const csvKader = await browser.evaluate(async () => {
        const res = await fetch("/bumindes/pembangunan/kader/ekspor");
        return {
          status: res.status,
          tipe: res.headers.get("content-type"),
          teks: await res.text(),
        };
      });
      expect(csvKader.status).toBe(200);
      expect(csvKader.tipe).toContain("text/csv");
      expect(csvKader.teks).toContain(namaKader);
      expect(csvKader.teks).toContain(bidang);
    } finally {
      await hapusBukuPembangunanDariNama(namaKegiatan);
      await hapusKaderPembangunanDariNama(namaKader);
    }
  },
);
