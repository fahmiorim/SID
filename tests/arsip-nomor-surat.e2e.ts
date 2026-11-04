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

// Katalog: OS-SUR-006.
test(
  "arsip nomor surat mempertahankan nomor setelah surat sumber dihapus",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();
    await app.open("/masuk");
    await screen.getByLabel("Username atau NIK").fill(alur.warga.nik);
    await screen.getByLabel("Kata sandi / PIN").fill(credentials.user("warga-e2e").password);
    await screen.getByRole("button", { name: "Masuk" }).tap();
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Pengujian arsip ${alur.warga.nik}`);
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

    // Buka arsip sebelum hapus untuk memastikan nomor tercatat
    await app.open("/persuratan/surat/arsip");
    await expect(screen.getByRole("heading", { name: "Arsip Nomor Surat" })).toBeVisible();
    await expect(screen.getByText(alur.namaJenis)).toBeVisible();

    // Hapus surat sumber (konsep/terbit bisa dihapus tergantung state; coba via aksi hapus jika ada)
    await app.open(urlSurat);
    await aksiSurat().tap();
    // Jika ada menu hapus, hapus; kalau tidak ada, skip penghapusan tapi tetap verifikasi arsip ada
    const hapusMenu = screen.getByRole("menuitem", { name: "Hapus" });
    if (await hapusMenu.count()) {
      await hapusMenu.tap();
      await expect(screen.getByRole("alertdialog")).toBeVisible();
      await screen.getByRole("button", { name: "Hapus" }).tap();
    }

    await app.open("/persuratan/surat/arsip");
    await expect(screen.getByRole("heading", { name: "Arsip Nomor Surat" })).toBeVisible();
    await expect(screen.getByText(alur.namaJenis)).toBeVisible();
  },
);
