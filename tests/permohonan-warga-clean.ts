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

// Katalog: OS-WGA-004/005; OS-SUR-002/003/005/007/008/014.
test(
  "warga mengajukan surat, operator menerbitkan, dan hanya pemilik yang dapat mengunduh",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    const masukSebagaiWarga = async (username: string, bersihkan = true) => {
      if (bersihkan) await app.clearState();
      await app.open("/masuk");
      await masukDenganKredensial(
        screen,
        browser,
        username,
        credentials.user("warga-e2e").password,
      );
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
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open(`/permohonan-surat?status=1`);
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });

    const verifikator = [
      {
        tahap: "Operator",
        username: alur.operatorUsername,
        password: credentials.user("warga-e2e-operator").password,
      },
      {
        tahap: "Sekretaris Desa",
        username: credentials.user("sekdes-e2e").username,
        password: credentials.user("sekdes-e2e").password,
      },
      {
        tahap: "Kepala Desa",
        username: credentials.user("kades-e2e").username,
        password: credentials.user("kades-e2e").password,
      },
    ];
    for (const step of verifikator) {
      await app.clearState();
      await app.open("/masuk");
      await masukDenganKredensial(screen, browser, step.username, step.password);
      await expect(browser).toHaveURL("/beranda");
      await app.open(urlSurat);
      await aksiSurat().tap();
      await screen.getByRole("menuitem", { name: `Verifikasi ${step.tahap}` }).tap();
      await expect(screen.getByRole("alertdialog")).toBeVisible();
      await screen.getByRole("button", { name: "Verifikasi" }).tap();
      await expect(screen.getByText(/Surat diverifikasi|Surat terverifikasi/i)).toBeVisible({
        timeout: 10_000,
      });
    }

    await app.open(urlSurat);
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Unduh PDF" })).toBeVisible();
    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
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
      await masukDenganKredensial(
        screen,
        browser,
        username,
        credentials.user("warga-e2e").password,
      );
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
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open(`/permohonan-surat?status=1`);
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Tolak & Kembalikan ke Konsep" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByLabel("Alasan penolakan").fill("Berkas kurang lengkap");
    await screen.getByRole("button", { name: "Tolak" }).tap();
    await expect(screen.getByText(/Surat ditolak/i)).toBeVisible({ timeout: 10_000 });

    await masukSebagaiWarga(alur.warga.nik);
    await app.open("/layanan-mandiri/surat");
    await expect(screen.getByText(/Dibatalkan/).first()).toBeVisible();
  },
);

test(
  "form permohonan mendukung variasi isian teks, angka, tanggal, pilihan, dan centang",
  { timeout: 180_000 },
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

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisVariasiId}`);
    await expect(
      screen.getByRole("heading", { name: `Ajukan ${alur.namaJenisVariasi}` }),
    ).toBeVisible();
    await expect(screen.getByText("Jenis surat ini tidak memerlukan berkas syarat.")).toBeVisible();

    // Kontrol dirender sesuai tipe isian, dan isian wajib ditandai required.
    expect(await screen.getByLabel(/Nama Kegiatan/).getAttribute("type")).toBe("text");
    expect(await screen.getByLabel(/Jumlah Peserta/).getAttribute("type")).toBe("number");
    expect(await screen.getByLabel(/Tanggal Kegiatan/).getAttribute("type")).toBe("date");
    expect(await screen.getByLabel(/Nama Kegiatan/).getAttribute("required")).not.toBeNull();
    expect(await screen.getByLabel(/Butuh Transport/).getAttribute("type")).toBe("checkbox");

    await screen.getByLabel(/Nama Kegiatan/).fill("Musyawarah Desa");
    await screen.getByLabel(/Alamat Kegiatan/).fill("Balai Desa");
    await screen.getByLabel(/Jumlah Peserta/).fill("25");
    await screen.getByLabel(/Tanggal Kegiatan/).fill("2026-11-20");
    await screen.getByLabel(/Kategori Kegiatan/).selectOption("Sosial");
    await screen.getByLabel(/Butuh Transport/).check();
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();

    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();
    await expect(screen.getByText(/Nomor antrian Anda:/)).toBeVisible();

    // Nilai semua tipe isian tersimpan, termasuk normalisasi centang ke "Ya".
    expect(await alur.ambilIsianPermohonan()).toEqual({
      nama_kegiatan: "Musyawarah Desa",
      alamat_kegiatan: "Balai Desa",
      jumlah_peserta: "25",
      tanggal_kegiatan: "2026-11-20",
      kategori_kegiatan: "Sosial",
      butuh_transport: "Ya",
    });

    await app.open("/layanan-mandiri/surat");
    await expect(screen.getByText(alur.namaJenisVariasi).first()).toBeVisible();
  },
);

test(
  "warga mengelola arsip dokumen pribadi dan unduhan hanya untuk pemilik",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    const masuk = async (nik: string, bersihkan = true) => {
      if (bersihkan) await app.clearState();
      await app.open("/masuk");
      await masukDenganKredensial(screen, browser, nik, credentials.user("warga-e2e").password);
      await expect(browser).toHaveURL("/layanan-mandiri/beranda");
    };
    const unduh = async (url: string) =>
      browser.evaluate(async (href: string) => {
        const response = await fetch(href);
        const payload = await response.arrayBuffer();
        return {
          status: response.status,
          contentType: response.headers.get("content-type"),
          signature: new TextDecoder().decode(payload.slice(0, 5)),
        };
      }, url);

    await masuk(alur.warga.nik, false);
    await app.open("/layanan-mandiri/dokumen");
    await screen.getByRole("button", { name: "Unggah dokumen" }).tap();
    await screen.getByLabel("Jenis dokumen").selectOption("KTP");
    await screen.getByLabel("Nama dokumen").fill("KTP Uji E2E");
    await screen.getByLabel(/Berkas/).setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Simpan" }).tap();
    await expect(screen.getByText("KTP Uji E2E")).toBeVisible();

    const href = await screen.getByRole("link", { name: "Unduh KTP Uji E2E" }).getAttribute("href");
    if (!href) throw new Error("Tautan dokumen tidak ditemukan.");

    const milikSendiri = await unduh(href);
    expect(milikSendiri.status).toBe(200);
    expect(milikSendiri.contentType).toContain("application/pdf");
    expect(milikSendiri.signature).toBe("%PDF-");

    await masuk(alur.wargaLain.nik);
    const milikOrangLain = await unduh(href);
    expect(milikOrangLain.status).toBe(404);

    await masuk(alur.warga.nik);
    await app.open("/layanan-mandiri/dokumen");
    await screen.getByRole("button", { name: "Ubah KTP Uji E2E" }).tap();
    await screen.getByLabel("Nama dokumen").fill("KTP Diperbarui");
    await screen.getByRole("button", { name: "Simpan" }).tap();
    await expect(screen.getByText("KTP Diperbarui")).toBeVisible();

    await screen.getByRole("button", { name: "Hapus KTP Diperbarui" }).tap();
    await screen.getByRole("button", { name: "Hapus" }).tap();
    await expect(screen.getByText("Belum ada dokumen. Unggah dokumen pertama Anda.")).toBeVisible();
  },
);
