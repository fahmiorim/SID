import { randomUUID } from "node:crypto";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";
import { PDFDocument } from "pdf-lib";

import { buatSuratUjiDenganToken, hapusSuratDariId } from "./support/database";

/**
 * Katalog: OS-SUR-008 — Cetak surat per varian template.
 *
 * Pemilih "Varian" di halaman cetak harus benar-benar mengubah tata letak:
 * potrait 210 mm, landscape 297 mm, dan compact memakai margin lebih kecil.
 */
test(
  "cetak surat: varian default, landscape, dan compact mengubah tata letak",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const token = `${randomUUID().replace(/-/g, "")}${randomUUID().replace(/-/g, "")}`;
    const nomor = `E2E-CETAK/${Date.now()}/2026`;
    const { id } = await buatSuratUjiDenganToken({
      token,
      nomor,
      jenis: "Surat Keterangan Uji Cetak",
      tanggal: "2026-11-10",
    });
    const kelasHalaman = async () =>
      browser.evaluate(() => document.querySelector("article")?.className ?? "");
    const ukuranPdf = async (varian: string) => {
      const base64 = await browser.evaluate(async (url) => {
        const res = await fetch(url);
        const bytes = new Uint8Array(await res.arrayBuffer());
        let teks = "";
        for (const byte of bytes) teks += String.fromCharCode(byte);
        return btoa(teks);
      }, `/persuratan/surat/${id}/pdf?varian=${varian}`);
      const pdf = await PDFDocument.load(Buffer.from(base64, "base64"));
      return pdf.getPage(0).getSize();
    };

    try {
      await app.open(`/persuratan/surat/${id}/cetak`);
      await expect(screen.getByText(/Nomor:/)).toBeVisible();
      await expect(
        screen.getByRole("img", { name: "Kode QR verifikasi keaslian surat" }),
      ).toBeVisible();
      expect(await kelasHalaman()).toContain("max-w-[210mm]");
      expect(await kelasHalaman()).toContain("p-10");
      const pdfDefault = await ukuranPdf("default");
      expect(pdfDefault.width).toBeLessThan(pdfDefault.height);

      await screen.getByRole("combobox").tap();
      await screen.getByRole("option", { name: "Landscape" }).tap();
      await expect(browser).toHaveURL(/varian=landscape/);
      await expect(screen.getByRole("combobox")).toContainText("Landscape");
      await expect(screen.getByText(/Nomor:/)).toBeVisible();
      expect(await kelasHalaman()).toContain("max-w-[297mm]");
      const pdfLandscape = await ukuranPdf("landscape");
      expect(pdfLandscape.width).toBeGreaterThan(pdfLandscape.height);

      await screen.getByRole("combobox").tap();
      await screen.getByRole("option", { name: "Compact (margin kecil)" }).tap();
      await expect(browser).toHaveURL(/varian=compact/);
      await expect(screen.getByRole("combobox")).toContainText("Compact");
      await expect(screen.getByText(/Nomor:/)).toBeVisible();
      expect(await kelasHalaman()).toContain("max-w-[210mm]");
      expect(await kelasHalaman()).toContain("p-6");
      const pdfCompact = await ukuranPdf("compact");
      expect(pdfCompact.width).toBeLessThan(pdfCompact.height);
    } finally {
      await hapusSuratDariId(id);
    }
  },
);
