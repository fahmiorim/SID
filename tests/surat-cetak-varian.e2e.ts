import { randomUUID } from "node:crypto";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";

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

    try {
      await app.open(`/persuratan/surat/${id}/cetak`);
      await expect(screen.getByText(/Nomor:/)).toBeVisible();
      await expect(
        screen.getByRole("img", { name: "Kode QR verifikasi keaslian surat" }),
      ).toBeVisible();
      expect(await kelasHalaman()).toContain("max-w-[210mm]");
      expect(await kelasHalaman()).toContain("p-10");

      await screen.getByRole("combobox").tap();
      await screen.getByRole("option", { name: "Landscape" }).tap();
      await expect(browser).toHaveURL(/varian=landscape/);
      await expect(screen.getByRole("combobox")).toContainText("Landscape");
      await expect(screen.getByText(/Nomor:/)).toBeVisible();
      expect(await kelasHalaman()).toContain("max-w-[297mm]");

      await screen.getByRole("combobox").tap();
      await screen.getByRole("option", { name: "Compact (margin kecil)" }).tap();
      await expect(browser).toHaveURL(/varian=compact/);
      await expect(screen.getByRole("combobox")).toContainText("Compact");
      await expect(screen.getByText(/Nomor:/)).toBeVisible();
      expect(await kelasHalaman()).toContain("max-w-[210mm]");
      expect(await kelasHalaman()).toContain("p-6");
    } finally {
      await hapusSuratDariId(id);
    }
  },
);
