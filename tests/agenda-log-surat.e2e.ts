import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { hapusSuratKeluarDariNomor, hapusSuratMasukDariNomor } from "./support/database";

/**
 * Katalog: OS-SUR-012 — buku agenda/ekspedisi dan log surat.
 *
 * Surat masuk/keluar dibuat lewat UI, lalu disposisi/ekspedisi dicatat. Buku
 * A6/A7 harus membacanya tanpa penyalinan manual, dan halaman log harus
 * menampilkan aksi yang sama dengan filter jenis serta pencarian.
 */
test(
  "OS-SUR-012 — buku agenda/ekspedisi membaca surat dan log menampilkan aksinya",
  { session: "admin", timeout: 240_000 },
  async ({ app, screen }) => {
    const cap = Date.now();
    const nomorMasuk = `LM-${cap}`;
    const nomorKeluar = `LK-${cap}`;
    const perihalMasuk = `Undangan Rapat E2E ${cap}`;
    const perihalKeluar = `Laporan Bulanan E2E ${cap}`;
    const instruksi = `Tindak lanjuti surat ${cap}`;

    try {
      // --- Surat masuk + disposisi -----------------------------------------
      await app.open("/persuratan/surat-masuk");
      await expect(screen.getByRole("heading", { name: "Surat Masuk" })).toBeVisible();
      await expect(screen.getByRole("link", { name: "Log Surat" })).toHaveAttribute(
        "href",
        "/persuratan/log-surat",
      );

      await screen.getByRole("button", { name: "Catat Surat Masuk" }).tap();
      await screen.getByLabel("Nomor Surat").fill(nomorMasuk);
      await screen.getByLabel("Pengirim").fill(`Kecamatan Log ${cap}`);
      await screen.getByLabel("Isi Singkat").fill(perihalMasuk);
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Surat masuk dicatat.")).toBeVisible({ timeout: 10_000 });

      await app.open(`/persuratan/surat-masuk?q=${encodeURIComponent(nomorMasuk)}`);
      const barisMasuk = screen.getByRole("row").filter({ hasText: nomorMasuk });
      await expect(barisMasuk).toBeVisible();
      await barisMasuk
        .getByRole("button", { name: new RegExp(`Aksi surat masuk ${nomorMasuk}`) })
        .tap();
      await screen.getByRole("menuitem", { name: "Disposisi" }).tap();
      await screen.getByLabel("Instruksi").fill(instruksi);
      await screen.getByRole("button", { name: "Simpan disposisi" }).tap();
      await expect(screen.getByText("Disposisi surat masuk ditambahkan.")).toBeVisible({
        timeout: 10_000,
      });

      // --- Surat keluar + ekspedisi ----------------------------------------
      await app.open("/persuratan/surat-keluar");
      await expect(screen.getByRole("heading", { name: "Surat Keluar" })).toBeVisible();
      await expect(screen.getByRole("link", { name: "Log Surat" })).toHaveAttribute(
        "href",
        "/persuratan/log-surat",
      );

      await screen.getByRole("button", { name: "Catat Surat Keluar" }).tap();
      await screen.getByLabel("Nomor Surat").fill(nomorKeluar);
      await screen.getByLabel("Tujuan").fill(`Dinas Log ${cap}`);
      await screen.getByLabel("Isi Singkat").fill(perihalKeluar);
      await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Surat keluar dicatat.")).toBeVisible({ timeout: 10_000 });

      await app.open(`/persuratan/surat-keluar?q=${encodeURIComponent(nomorKeluar)}`);
      const barisKeluar = screen.getByRole("row").filter({ hasText: nomorKeluar });
      await expect(barisKeluar).toBeVisible();
      await barisKeluar
        .getByRole("button", { name: new RegExp(`Aksi surat keluar ${nomorKeluar}`) })
        .tap();
      await screen.getByRole("menuitem", { name: "Ekspedisi" }).tap();
      await screen.getByLabel("Tanggal kirim").fill("2026-11-10");
      await screen.getByRole("button", { name: "Simpan ekspedisi" }).tap();
      await expect(screen.getByText("Ekspedisi surat keluar dicatat.")).toBeVisible({
        timeout: 10_000,
      });

      // --- Buku agenda membaca sumber persuratan ---------------------------
      await app.open("/bumindes/sekretariat/agenda");
      await expect(
        screen.getByRole("heading", { name: "Buku Agenda dan Ekspedisi" }),
      ).toBeVisible();

      const agendaMasuk = screen.getByRole("row").filter({ hasText: nomorMasuk });
      await expect(agendaMasuk).toBeVisible();
      await expect(agendaMasuk).toContainText("Surat Masuk");
      await expect(agendaMasuk).toContainText(perihalMasuk);
      await expect(agendaMasuk).toContainText(`Kecamatan Log ${cap}`);

      const agendaKeluar = screen.getByRole("row").filter({ hasText: nomorKeluar });
      await expect(agendaKeluar).toBeVisible();
      await expect(agendaKeluar).toContainText("Surat Keluar");
      await expect(agendaKeluar).toContainText(perihalKeluar);
      await expect(agendaKeluar).toContainText(`Dinas Log ${cap}`);

      await screen.getByRole("link", { name: "Cetak Agenda" }).tap();
      await expect(screen.getByRole("heading", { name: /BUKU AGENDA \(A6\)/i })).toBeVisible();
      await expect(screen.getByText(new RegExp(perihalMasuk))).toBeVisible();
      await expect(screen.getByText(new RegExp(perihalKeluar))).not.toBeVisible();

      await app.open("/bumindes/sekretariat/agenda/cetak?jenis=keluar");
      await expect(screen.getByRole("heading", { name: /BUKU EKSPEDISI \(A7\)/i })).toBeVisible();
      await expect(screen.getByText(new RegExp(perihalKeluar))).toBeVisible();
      await expect(screen.getByText(new RegExp(perihalMasuk))).not.toBeVisible();

      // --- Log surat: kedua aksi, filter, dan pencarian --------------------
      await app.open("/persuratan/log-surat");
      await expect(screen.getByRole("heading", { name: "Log Surat" })).toBeVisible();

      const logMasuk = screen.getByRole("row").filter({ hasText: nomorMasuk });
      await expect(logMasuk).toBeVisible();
      await expect(logMasuk).toContainText("Surat Masuk");
      await expect(logMasuk).toContainText("Disposisi");
      await expect(logMasuk).toContainText(instruksi);

      const logKeluar = screen.getByRole("row").filter({ hasText: nomorKeluar });
      await expect(logKeluar).toBeVisible();
      await expect(logKeluar).toContainText("Surat Keluar");
      await expect(logKeluar).toContainText("Ekspedisi");

      await app.open("/persuratan/log-surat?type=masuk");
      await expect(screen.getByRole("row").filter({ hasText: nomorMasuk })).toBeVisible();
      await expect(screen.getByRole("row").filter({ hasText: nomorKeluar })).not.toBeVisible();

      await app.open("/persuratan/log-surat?type=keluar");
      await expect(screen.getByRole("row").filter({ hasText: nomorKeluar })).toBeVisible();
      await expect(screen.getByRole("row").filter({ hasText: nomorMasuk })).not.toBeVisible();

      await app.open(`/persuratan/log-surat?q=${encodeURIComponent(instruksi)}`);
      await expect(screen.getByRole("row").filter({ hasText: nomorMasuk })).toBeVisible();
      await expect(screen.getByRole("row").filter({ hasText: nomorKeluar })).not.toBeVisible();
    } finally {
      await hapusSuratMasukDariNomor(nomorMasuk);
      await hapusSuratKeluarDariNomor(nomorKeluar);
    }
  },
);
