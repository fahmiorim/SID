import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusKeuanganTahun, hapusLaporanDokumenDariJudul } from "./support/database";

const TAHUN_DOKUMEN = 2030;
const TAHUN_APBDES = 2098;

/**
 * Katalog: OS-FIN-004 — Arsip dokumen laporan periodik.
 *
 * Impor PDF lewat dialog harus benar-benar tersimpan: baris muncul di arsip,
 * berkas dapat diunduh sebagai PDF, tanggal penyerahan tercatat, periode yang
 * sama ditolak saat diimpor ulang, dan penghapusan membersihkan baris.
 */
test(
  "dokumen laporan: impor PDF tersimpan, diserahkan, tolak duplikat, lalu dihapus",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const judul = `Laporan Impor E2E ${Date.now()}`;
    const berkas = "tests/fixtures/berkas-uji-e2e.pdf";

    try {
      await app.open(`/keuangan/laporan-dokumen?tahun=${TAHUN_DOKUMEN}`);
      await expect(screen.getByRole("heading", { name: "Dokumen Laporan APBDes" })).toBeVisible();

      // 1. Impor satu PDF dengan metadata yang unik.
      await screen.getByRole("button", { name: "Impor Dokumen" }).tap();
      const dialogImpor = screen.getByRole("dialog");
      await expect(
        dialogImpor.getByRole("heading", { name: "Impor Dokumen Laporan" }),
      ).toBeVisible();
      await browser.locator('input[type="file"]').setInputFiles(berkas);
      await expect(dialogImpor.getByText("OK", { exact: true })).toBeVisible({
        timeout: 15_000,
      });
      await dialogImpor.getByPlaceholder("Judul dokumen").fill(judul);
      await dialogImpor.getByRole("button", { name: "Impor 1 Berkas" }).tap();
      await expect(screen.getByText("1 dokumen laporan berhasil diimpor.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(dialogImpor).not.toBeVisible({ timeout: 15_000 });

      // 2. Baris arsip memuat metadata impor dan berkasnya benar-benar PDF.
      await app.open(`/keuangan/laporan-dokumen?tahun=${TAHUN_DOKUMEN}`);
      const baris = () => screen.getByRole("row").filter({ hasText: judul });
      await expect(baris()).toBeVisible({ timeout: 15_000 });
      await expect(baris().getByText("Laporan APBDes")).toBeVisible();
      await expect(baris().getByText("Semester I")).toBeVisible();

      const tautanUnduh = await browser.evaluate(() => {
        const tautan = [...document.querySelectorAll("a")].find(
          (item) => item.textContent?.trim() === "Unduh PDF",
        );
        return tautan ? tautan.getAttribute("href") : null;
      });
      expect(tautanUnduh).toMatch(/^\/keuangan\/laporan-dokumen\/\d+\/berkas$/);

      const pdf = await browser.evaluate(async (href) => {
        const res = await fetch(href as string);
        return {
          status: res.status,
          contentType: res.headers.get("content-type"),
          ukuran: (await res.arrayBuffer()).byteLength,
        };
      }, tautanUnduh);
      expect(pdf.status).toBe(200);
      expect(pdf.contentType).toContain("application/pdf");
      expect(pdf.ukuran).toBeGreaterThan(0);

      // Ekspor laporan APBDes memakai tahun yang sama dengan arsip dokumen.
      await expect(screen.getByRole("link", { name: "CSV RP APBDes" })).toHaveAttribute(
        "href",
        `/keuangan/laporan/ekspor?tahun=${TAHUN_DOKUMEN}`,
      );
      const csvLaporan = await browser.evaluate(async (tahun) => {
        const res = await fetch(`/keuangan/laporan/ekspor?tahun=${tahun}`);
        return {
          status: res.status,
          type: res.headers.get("content-type") ?? "",
          body: await res.text(),
        };
      }, TAHUN_DOKUMEN);
      expect(csvLaporan.status).toBe(200);
      expect(csvLaporan.type).toContain("text/csv");
      expect(csvLaporan.body).toContain("Laporan Realisasi Pelaksanaan APBDes");
      expect(csvLaporan.body).toContain(String(TAHUN_DOKUMEN));

      const excelLaporan = await browser.evaluate(async (tahun) => {
        const res = await fetch(`/keuangan/laporan/ekspor-excel?tahun=${tahun}`);
        return {
          status: res.status,
          type: res.headers.get("content-type") ?? "",
          ukuran: (await res.arrayBuffer()).byteLength,
        };
      }, TAHUN_DOKUMEN);
      expect(excelLaporan.status).toBe(200);
      expect(excelLaporan.type).toContain("excel");
      expect(excelLaporan.ukuran).toBeGreaterThan(0);

      // 3. Catat tanggal penyerahan.
      await baris()
        .getByRole("button", { name: `Aksi dokumen ${judul}` })
        .tap();
      await screen.getByRole("menuitem", { name: "Catat penyerahan" }).tap();
      const dialogSerah = screen.getByRole("dialog");
      await expect(dialogSerah.getByRole("heading", { name: "Tanggal Penyerahan" })).toBeVisible();
      await dialogSerah.getByLabel("Tanggal diserahkan").fill("2026-11-10");
      await dialogSerah.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(dialogSerah).not.toBeVisible({ timeout: 15_000 });
      await expect(baris().getByText("Diserahkan")).toBeVisible();

      // Dokumen yang sudah diserahkan tampil di APBDes publik dan dapat diunduh.
      await app.open(`/desa/apbdes?tahun=${TAHUN_DOKUMEN}`);
      await expect(screen.getByRole("heading", { name: "Dokumen Laporan" })).toBeVisible({
        timeout: 15_000,
      });
      const tautanPublik = screen.getByRole("link", { name: new RegExp(judul) });
      await expect(tautanPublik).toBeVisible();
      const hrefPublik = await tautanPublik.getAttribute("href");
      expect(hrefPublik).toMatch(/^\/desa\/apbdes\/dokumen\/\d+\/berkas$/);
      const pdfPublik = await browser.evaluate(async (href) => {
        const res = await fetch(href as string);
        return {
          status: res.status,
          contentType: res.headers.get("content-type"),
          ukuran: (await res.arrayBuffer()).byteLength,
        };
      }, hrefPublik);
      expect(pdfPublik.status).toBe(200);
      expect(pdfPublik.contentType).toContain("application/pdf");
      expect(pdfPublik.ukuran).toBeGreaterThan(0);

      // Kembali ke arsip untuk melanjutkan uji duplikat.
      await app.open(`/keuangan/laporan-dokumen?tahun=${TAHUN_DOKUMEN}`);

      // 4. Periode yang sama ditolak saat diimpor ulang.
      await screen.getByRole("button", { name: "Impor Dokumen" }).tap();
      const dialogUlang = screen.getByRole("dialog");
      await browser.locator('input[type="file"]').setInputFiles(berkas);
      await dialogUlang.getByPlaceholder("Judul dokumen").fill(judul);
      await dialogUlang.getByRole("button", { name: "Impor 1 Berkas" }).tap();
      await expect(dialogUlang.getByText(/sudah ada/)).toBeVisible({ timeout: 15_000 });
      await dialogUlang.getByRole("button", { name: "Batal" }).tap();

      // 5. Hapus lewat aksi baris (berkas ikut dibersihkan server).
      await baris()
        .getByRole("button", { name: `Aksi dokumen ${judul}` })
        .tap();
      await screen.getByRole("menuitem", { name: "Hapus" }).tap();
      const konfirmasi = screen.getByRole("alertdialog");
      await expect(konfirmasi.getByText("Hapus dokumen laporan?")).toBeVisible();
      await konfirmasi.getByRole("button", { name: "Hapus", exact: true }).tap();
      await expect(screen.getByText("Dokumen laporan dihapus.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(screen.getByText(judul)).toHaveCount(0);
    } finally {
      await hapusLaporanDokumenDariJudul(judul);
    }
  },
);

/**
 * Katalog: OS-FIN-006 — Transparansi APBDes.
 *
 * Pagu, realisasi, dan realisasi triwulan yang diisi admin harus tampil di
 * laporan publik `/desa/apbdes?tahun=...`, bukan hanya halaman yang merender.
 */
test(
  "APBDes publik: pagu, realisasi, dan triwulan tampil di laporan desa",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    try {
      await app.open(`/keuangan/anggaran?tahun=${TAHUN_APBDES}`);
      await expect(browser.locator("h1")).toContainText("APBDes");

      const baris = screen.getByRole("row").filter({ hasText: "HASIL USAHA" });
      await baris.getByRole("textbox").first().fill("12000000");
      await baris.getByRole("textbox").last().fill("3000000");
      await expect(screen.getByText("1 baris berubah")).toBeVisible();
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Anggaran & realisasi disimpan.")).toBeVisible();

      await app.open(`/keuangan/triwulan?tahun=${TAHUN_APBDES}`);
      const tw1 = screen.getByLabel(/TW1$/).first();
      await tw1.fill("1250000");
      await screen.getByRole("button", { name: "Simpan Realisasi" }).tap();
      await expect(screen.getByText("Realisasi triwulan disimpan.")).toBeVisible();

      await app.open(`/desa/apbdes?tahun=${TAHUN_APBDES}`);
      await expect(browser.locator("h1")).toContainText(/APBDes/i);
      const teks = await browser.locator("body").textContent();
      expect(teks).toContain(String(TAHUN_APBDES));
      expect(teks).toMatch(/12\.000\.000/);
      expect(teks).toMatch(/3\.000\.000/);
      expect(teks).toContain("Realisasi per Periode (Triwulan)");
      expect(teks).toMatch(/1\.250\.000/);
    } finally {
      await hapusKeuanganTahun(TAHUN_APBDES);
    }
  },
);
