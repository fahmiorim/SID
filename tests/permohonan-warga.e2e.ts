import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

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

// Katalog: OS-WGA-004/005; OS-SUR-002/003/005/007/008/014.
test(
  "warga mengajukan surat, operator menerbitkan, dan hanya pemilik yang dapat mengunduh",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    const masukSebagaiWarga = async (username: string, bersihkan = true) => {
      if (bersihkan) await app.clearState();
      await app.open("/masuk");
      await screen.getByLabel("Username atau NIK").fill(username);
      await screen.getByLabel("Kata sandi / PIN").fill(credentials.user("warga-e2e").password);
      await screen.getByRole("button", { name: "Masuk" }).tap();
      await expect(browser).toHaveURL("/layanan-mandiri/beranda");
    };
    const bukaBerkas = async (nama: string) => {
      const href = await screen.getByRole("link", { name: nama }).getAttribute("href");
      if (!href) throw new Error(`Tautan ${nama} tidak ditemukan.`);
      return href;
    };
    const unduh = async (url: string) =>
      browser.evaluate(async (href: string) => {
        const response = await fetch(href);
        const payload = await response.arrayBuffer();
        return {
          status: response.status,
          contentType: response.headers.get("content-type"),
          cacheControl: response.headers.get("cache-control"),
          signature: new TextDecoder().decode(payload.slice(0, 5)),
        };
      }, url);
    await masukSebagaiWarga(alur.warga.nik, false);
    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await expect(screen.getByRole("heading", { name: `Ajukan ${alur.namaJenis}` })).toBeVisible();
    await screen.getByLabel("Keterangan").fill(`Pengujian alur ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    const berkasSyaratUrl = await bukaBerkas(alur.syaratNama);
    const berkasMilikWarga = await unduh(berkasSyaratUrl);
    expect(berkasMilikWarga.status).toBe(200);
    expect(berkasMilikWarga.contentType).toContain("application/pdf");
    expect(berkasMilikWarga.cacheControl).toContain("private");
    expect(berkasMilikWarga.signature).toBe("%PDF-");

    await masukSebagaiWarga(alur.wargaLain.nik);
    const berkasWargaLain = await unduh(berkasSyaratUrl);
    expect(berkasWargaLain.status).toBe(404);

    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await screen.getByLabel("Username atau NIK").fill(alur.operatorUsername);
    await screen.getByLabel("Kata sandi / PIN").fill(operator.password);
    await screen.getByRole("button", { name: "Masuk" }).tap();
    await expect(browser).toHaveURL("/beranda");

    await app.open(`/permohonan-surat?status=1`);
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });

    for (const tahap of ["Operator", "Sekretaris Desa", "Kepala Desa"]) {
      await aksiSurat().tap();
      await screen.getByRole("menuitem", { name: `Verifikasi ${tahap}` }).tap();
      await expect(screen.getByRole("alertdialog")).toBeVisible();
      await screen.getByRole("button", { name: "Verifikasi" }).tap();
      await expect(aksiSurat()).toBeVisible();
      await app.open(urlSurat);
    }

    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Unduh PDF" })).toBeVisible();
    await app.clearState();
    await app.open("/masuk");
    await screen.getByLabel("Username atau NIK").fill(alur.warga.nik);
    await screen.getByLabel("Kata sandi / PIN").fill(credentials.user("warga-e2e").password);
    await screen.getByRole("button", { name: "Masuk" }).tap();
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open("/layanan-mandiri/surat");
    await expect(screen.getByText("Siap Diambil")).toBeVisible();
    const suratPdfUrl = await bukaBerkas("Unduh PDF");
    const pdfMilikWarga = await unduh(suratPdfUrl);
    expect(pdfMilikWarga.status).toBe(200);
    expect(pdfMilikWarga.contentType).toContain("application/pdf");
    expect(pdfMilikWarga.cacheControl).toContain("private");
    expect(pdfMilikWarga.signature).toBe("%PDF-");

    await masukSebagaiWarga(alur.wargaLain.nik);
    const pdfWargaLain = await unduh(suratPdfUrl);
    expect(pdfWargaLain.status).toBe(404);
  },
);

test(
  "operator menolak permohonan dan surat dikembalikan ke konsep",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    const masukSebagaiWarga = async (username: string) => {
      await app.clearState();
      await app.open("/masuk");
      await screen.getByLabel("Username atau NIK").fill(username);
      await screen.getByLabel("Kata sandi / PIN").fill(credentials.user("warga-e2e").password);
      await screen.getByRole("button", { name: "Masuk" }).tap();
      await expect(browser).toHaveURL("/layanan-mandiri/beranda");
    };

    await masukSebagaiWarga(alur.warga.nik);
    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await expect(screen.getByRole("heading", { name: `Ajukan ${alur.namaJenis}` })).toBeVisible();
    await screen.getByLabel("Keterangan").fill(`Pengujian tolak ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await screen.getByLabel("Username atau NIK").fill(alur.operatorUsername);
    await screen.getByLabel("Kata sandi / PIN").fill(operator.password);
    await screen.getByRole("button", { name: "Masuk" }).tap();
    await expect(browser).toHaveURL("/beranda");

    await app.open(`/permohonan-surat?status=1`);
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Tolak & Kembalikan ke Konsep" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByLabel("Alasan penolakan").fill("Berkas kurang lengkap");
    await screen.getByRole("button", { name: "Tolak" }).tap();
    await expect(screen.getByText("Surat ditolak")).toBeVisible();

    await masukSebagaiWarga(alur.warga.nik);
    await app.open("/layanan-mandiri/surat");
    await expect(screen.getByText("Permohonan Dibatalkan")).toBeVisible();
  },
);
