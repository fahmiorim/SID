import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatTanahKasUji, hapusTanahKasDariNomorPersil } from "./support/database";

/**
 * Katalog: OS-FIN-011 — buku tanah desa dan tanah kas desa.
 *
 * Buku ini belum punya formulir tulis di UI, jadi baris sumber disiapkan
 * langsung di tabel resmi. Yang diuji adalah jalur baca yang dipakai petugas:
 * daftar persil, riwayat mutasi, halaman cetak ber-kop, dan CSV resmi.
 */
test(
  "OS-FIN-011 — persil dan mutasi tanah kas tampil di buku, cetak, dan CSV",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const nomorPersil = `TKD-${cap}`;
    const asal = `Bengkok E2E ${cap}`;
    const lokasi = `Dusun Tanah Uji ${cap}`;
    const uraianMutasi = `Sewa tanah kas E2E ${cap}`;

    try {
      await buatTanahKasUji({
        nomorPersil,
        asal,
        luas: "125.50",
        lokasi,
        status: "disewakan",
        nilai: "7500000.00",
        jenisMutasi: "sewa",
        uraianMutasi,
      });

      await app.open("/bumindes/tanah-kas");
      await expect(screen.getByRole("heading", { name: "Buku Tanah Kas Desa (E1)" })).toBeVisible();

      const barisPersil = screen.getByRole("row").filter({ hasText: nomorPersil });
      await expect(barisPersil).toBeVisible();
      await expect(barisPersil).toContainText(asal);
      await expect(barisPersil).toContainText(lokasi);
      await expect(barisPersil).toContainText("125.50");
      await expect(barisPersil).toContainText("disewakan");
      await expect(barisPersil).toContainText("7500000.00");

      const barisMutasi = screen.getByRole("row").filter({ hasText: uraianMutasi });
      await expect(barisMutasi).toBeVisible();
      await expect(barisMutasi).toContainText("sewa");
      await expect(barisMutasi).toContainText("2.50");
      await expect(barisMutasi).toContainText("1500000.00");

      await screen.getByRole("link", { name: "Cetak Buku" }).tap();
      await expect(
        screen.getByRole("heading", { name: /BUKU TANAH KAS DESA \(E1\)/i }),
      ).toBeVisible();
      await expect(screen.getByText(nomorPersil)).toBeVisible();
      await expect(screen.getByText(lokasi)).toBeVisible();

      await app.open("/bumindes/tanah-kas/mutasi/cetak");
      await expect(
        screen.getByRole("heading", { name: /BUKU TANAH KAS DESA \(MUTASI\)/i }),
      ).toBeVisible();
      await expect(screen.getByText(new RegExp(`\\[Persil ${nomorPersil}\\]`))).toBeVisible();
      await expect(screen.getByText(new RegExp(uraianMutasi))).toBeVisible();

      const csvPersil = await browser.evaluate(async () => {
        const res = await fetch("/bumindes/tanah-kas/ekspor");
        return {
          status: res.status,
          tipe: res.headers.get("content-type"),
          teks: await res.text(),
        };
      });
      expect(csvPersil.status).toBe(200);
      expect(csvPersil.tipe).toContain("text/csv");
      expect(csvPersil.teks).toContain(nomorPersil);
      expect(csvPersil.teks).toContain(asal);

      const csvMutasi = await browser.evaluate(async () => {
        const res = await fetch("/bumindes/tanah-kas/mutasi/ekspor");
        return {
          status: res.status,
          tipe: res.headers.get("content-type"),
          teks: await res.text(),
        };
      });
      expect(csvMutasi.status).toBe(200);
      expect(csvMutasi.tipe).toContain("text/csv");
      expect(csvMutasi.teks).toContain(uraianMutasi);
    } finally {
      await hapusTanahKasDariNomorPersil(nomorPersil);
    }
  },
);
