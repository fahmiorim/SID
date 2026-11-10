import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import { masukDenganKredensial } from "./support/login";
import {
  buatFixturePermohonanWarga,
  type PermohonanWargaFixture,
} from "./support/permohonan-warga-fixture";

const test = webTest.extend<{ alur: PermohonanWargaFixture }>({
  alur: async ({}, gunakan) => {
    const alur = await buatFixturePermohonanWarga();
    try {
      await gunakan(alur);
    } finally {
      await alur.hapus();
    }
  },
});

/**
 * Katalog: OS-SUR-005 — Rekap permohonan surat.
 *
 * Permohonan warga yang baru dikirim harus muncul pada rekap per jenis surat,
 * filter status mempersempit daftar, dan ekspor CSV membawa filter yang sama
 * beserta identitas pemohon.
 */
test(
  "rekap permohonan: rekap per jenis, filter status, dan ekspor CSV",
  { timeout: 240_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await expect(screen.getByRole("heading", { name: `Ajukan ${alur.namaJenis}` })).toBeVisible();
    await screen.getByLabel("Keterangan").fill(`Rekap uji ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible({ timeout: 10_000 });

    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.operatorUsername,
      credentials.user("warga-e2e-operator").password,
    );
    await expect(browser).toHaveURL("/beranda");

    await app.open("/permohonan-surat");
    await expect(screen.getByRole("heading", { name: "Permohonan Surat" })).toBeVisible();
    await expect(screen.getByText("Rekap per Jenis Surat")).toBeVisible();
    const barisRekap = screen.getByRole("row").filter({ hasText: alur.namaJenis });
    await expect(barisRekap.first()).toBeVisible();
    expect(await barisRekap.first().getByRole("cell").count()).toBe(5);

    // Filter status: permohonan baru berstatus menunggu (1).
    await app.open("/permohonan-surat?status=1");
    await expect(screen.getByRole("row").filter({ hasText: alur.warga.nik }).first()).toBeVisible();

    // Status selesai (3) tidak boleh memuat permohonan yang masih menunggu.
    await app.open("/permohonan-surat?status=3");
    await expect(
      screen.getByRole("row").filter({ hasText: alur.warga.nik }).first(),
    ).not.toBeVisible();

    // Ekspor CSV membawa filter status yang sedang aktif.
    await app.open("/permohonan-surat?status=1");
    const href = await screen.getByRole("link", { name: /Ekspor CSV/ }).getAttribute("href");
    if (!href) throw new Error("Tautan ekspor CSV tidak ditemukan.");
    expect(href).toContain("status=1");

    const csv = await browser.evaluate(async (url: string) => {
      const respons = await fetch(url);
      return {
        status: respons.status,
        tipe: respons.headers.get("content-type"),
        disposisi: respons.headers.get("content-disposition"),
        isi: await respons.text(),
      };
    }, href);
    expect(csv.status).toBe(200);
    expect(csv.tipe).toContain("text/csv");
    expect(csv.disposisi).toContain("rekap-permohonan-surat-");
    expect(csv.isi).toContain("No. Antrian");
    expect(csv.isi).toContain(alur.warga.nik);
    expect(csv.isi).toContain(alur.namaJenis);
  },
);
