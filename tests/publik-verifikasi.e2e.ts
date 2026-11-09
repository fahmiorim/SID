import { randomBytes } from "node:crypto";
import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import { buatSuratUjiDenganToken, hapusSuratDariToken } from "./support/database";
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

// Katalog: OS-SUR-008/019.
test(
  "verifikasi surat publik menampilkan data surat terbit via token valid",
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

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Pengujian verifikasi publik ${alur.warga.nik}`);
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

    const surat = await alur.ambilSuratTerbit();
    expect(surat?.number).toBeDefined();
    expect(surat?.verificationToken).toBeDefined();

    await app.clearState();
    await app.open(`/desa/verifikasi-surat/${surat!.verificationToken}`);
    await expect(screen.getByText(new RegExp(alur.namaJenis)).first()).toBeVisible();
    await expect(screen.getByText(surat!.number!).first()).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-019 — Verifikasi surat publik lewat form token (jalur kode
 * QR) tanpa sesi, serta penolakan token tidak dikenal/berformat salah.
 */
test(
  "verifikasi surat publik: form token, token valid, dan token tidak dikenal",
  { timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const token = randomBytes(32).toString("hex");
    const nomor = `E2E/VER/${Date.now()}`;
    await buatSuratUjiDenganToken({
      token,
      nomor,
      jenis: "Surat Keterangan Uji E2E",
      tanggal: "2026-11-10",
    });

    try {
      // Form token adalah jalur yang dipakai pemindai kode QR.
      await app.open("/desa/verifikasi-surat");
      await expect(screen.getByRole("heading", { name: "Verifikasi Surat" })).toBeVisible();
      await expect(screen.getByLabel("Token verifikasi")).toBeVisible();

      // Token berformat salah ditolak tanpa membocorkan surat mana pun.
      await screen.getByLabel("Token verifikasi").fill("token-tidak-valid");
      await screen.getByRole("button", { name: "Verifikasi" }).tap();
      await expect(browser).toHaveURL(/\/desa\/verifikasi-surat\/token-tidak-valid$/);
      await expect(screen.getByRole("heading", { name: "Surat Tidak Ditemukan" })).toBeVisible();

      // Token 64 hex yang valid milik desa ini menampilkan data surat terbit.
      await app.open(`/desa/verifikasi-surat?token=${token}`);
      await expect(browser).toHaveURL(new RegExp(`/desa/verifikasi-surat/${token}$`));
      await expect(screen.getByRole("heading", { name: "Verifikasi Surat" })).toBeVisible();
      await expect(screen.getByText(nomor)).toBeVisible();
      await expect(screen.getByText("Siap Diambil", { exact: true })).toBeVisible();
    } finally {
      await hapusSuratDariToken(token);
    }

    // Surat yang sudah dihapus tidak lagi dapat diverifikasi lewat tokennya.
    await app.open(`/desa/verifikasi-surat/${token}`);
    await expect(screen.getByRole("heading", { name: "Surat Tidak Ditemukan" })).toBeVisible();
    await expect(screen.getByText(nomor)).toHaveCount(0);
  },
);

test(
  "verifikasi surat token page loads publicly",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/verifikasi-surat/token-test");
    await expect(browser.locator("body")).toBeVisible();
  },
);
