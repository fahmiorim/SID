import { randomUUID } from "node:crypto";
import { test as webTest, type Browser } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatFixtureAnjungan, type AnjunganFixture } from "./support/anjungan-fixture";
import { hapusAnjunganDariNama } from "./support/database";

const test = webTest.extend<{ anjungan: AnjunganFixture }>({
  anjungan: async ({}, gunakan) => {
    const fixture = await buatFixtureAnjungan();
    try {
      await gunakan(fixture);
    } finally {
      await fixture.hapus();
    }
  },
});

function urlDasar(): string {
  return new URL(process.env.APP_URL ?? "http://localhost:3000").origin;
}

async function pasangPerangkat(browser: Browser, uuid: string): Promise<void> {
  await browser.evaluate((value) => localStorage.setItem("anjungan_uuid", value), uuid);
  await browser.setCookies([{ name: "anjungan_uuid", value: uuid, url: urlDasar() }]);
}

// Katalog: OS-MOD-001 — CRUD anjungan admin, visibilitas publik, isolasi tenant.
test(
  "admin mengelola anjungan dan perangkat desa lain tidak tampil di publik",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser, anjungan }) => {
    const nama = `Anjungan CRUD ${Date.now()}`;
    const namaDiubah = `${nama} Diubah`;
    const uuid = randomUUID();

    try {
      await app.open("/anjungan");
      await screen.getByRole("button", { name: "Tambah Anjungan" }).tap();
      const dialogTambah = screen.getByRole("dialog", { name: "Tambah Anjungan" });
      await expect(dialogTambah).toBeVisible();
      await dialogTambah.getByLabel("Nama").fill(nama);
      await dialogTambah.getByLabel(/UUID/).fill(uuid);
      await dialogTambah.getByLabel("Surat Tanpa Akun").fill("1");
      await dialogTambah.getByLabel("Virtual Keyboard").fill("0");
      await dialogTambah.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Anjungan berhasil ditambahkan.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(dialogTambah).not.toBeVisible({ timeout: 15_000 });
      await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();

      await app.open("/desa/anjungan");
      await pasangPerangkat(browser, uuid);
      await app.open("/desa/anjungan");
      await expect(screen.getByText(nama, { exact: true })).toBeVisible();

      await app.open("/anjungan");
      await screen.getByRole("button", { name: `Ubah anjungan ${nama}` }).tap();
      const dialogUbah = screen.getByRole("dialog", { name: "Ubah Anjungan" });
      await expect(dialogUbah).toBeVisible();
      await dialogUbah.getByLabel("Nama").fill(namaDiubah);
      await dialogUbah.getByRole("combobox").last().tap();
      await screen.getByRole("option", { name: "Nonaktif" }).tap();
      await dialogUbah.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Anjungan berhasil diperbarui.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(dialogUbah).not.toBeVisible({ timeout: 15_000 });

      await app.open("/desa/anjungan");
      await expect(screen.getByText(namaDiubah, { exact: true })).not.toBeVisible();

      await app.open("/anjungan");
      await screen.getByRole("button", { name: `Ubah anjungan ${namaDiubah}` }).tap();
      const dialogAktif = screen.getByRole("dialog", { name: "Ubah Anjungan" });
      await dialogAktif.getByRole("combobox").last().tap();
      await screen.getByRole("option", { name: "Aktif", exact: true }).tap();
      await dialogAktif.getByRole("button", { name: "Simpan", exact: true }).tap();
      await expect(screen.getByText("Anjungan berhasil diperbarui.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(dialogAktif).not.toBeVisible({ timeout: 15_000 });

      await app.open("/desa/anjungan");
      await expect(screen.getByText(namaDiubah, { exact: true })).toBeVisible();

      // UUID terdaftar milik desa lain tidak boleh dikenali di host desa ini.
      await pasangPerangkat(browser, anjungan.desaLain.uuid);
      await app.open("/desa/anjungan");
      await expect(screen.getByText(anjungan.desaLain.nama, { exact: true })).not.toBeVisible();
      await expect(screen.getByText(namaDiubah, { exact: true })).toBeVisible();

      await app.open("/anjungan");
      await screen.getByRole("button", { name: `Hapus anjungan ${namaDiubah}` }).tap();
      await expect(screen.getByText("Anjungan berhasil dihapus.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(screen.getByRole("cell", { name: namaDiubah, exact: true })).not.toBeVisible();

      await app.open("/desa/anjungan");
      await expect(screen.getByText(namaDiubah, { exact: true })).not.toBeVisible();
    } finally {
      await hapusAnjunganDariNama(nama);
      await hapusAnjunganDariNama(namaDiubah);
    }
  },
);

// Katalog: OS-MOD-001 — login NIK + tanggal lahir, ajukan surat tanpa akun,
// dan gerbang perangkat yang tidak berizin.
test(
  "kiosk memverifikasi NIK dan mengajukan surat tanpa akun",
  { session: "admin", timeout: 120_000 },
  async ({ app, screen, browser, anjungan }) => {
    const kiosk = anjungan.kiosk;

    await app.open("/desa/anjungan");
    await pasangPerangkat(browser, kiosk.uuid);
    await app.open("/desa/anjungan/permohonan");
    await expect(screen.getByText("Verifikasi identitas", { exact: true })).toBeVisible();

    await screen.getByLabel("NIK").fill(kiosk.nik);
    await screen.getByLabel("Tanggal lahir").fill("1991-01-01");
    await screen.getByRole("button", { name: "Verifikasi & lanjutkan" }).tap();
    await expect(screen.getByText(/tidak cocok/i).first()).toBeVisible({ timeout: 15_000 });

    await screen.getByLabel("Tanggal lahir").fill(kiosk.tanggalLahir);
    await screen.getByRole("button", { name: "Verifikasi & lanjutkan" }).tap();
    await expect(screen.getByRole("heading", { name: "Permohonan Surat" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(screen.getByText(kiosk.namaPenduduk, { exact: false })).toBeVisible();
    await expect(screen.getByText(kiosk.namaJenis, { exact: true })).toBeVisible();

    await app.open(`/desa/anjungan/permohonan?jenis=${kiosk.jenisId}`);
    await expect(screen.getByRole("heading", { name: `Ajukan ${kiosk.namaJenis}` })).toBeVisible();
    await screen.getByLabel("Nomor HP aktif").fill("081234567890");
    await screen.getByLabel("Keterangan").fill("Permohonan dari kiosk E2E");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible({
      timeout: 15_000,
    });
    await expect(screen.getByText(/Nomor antrian Anda:/)).toBeVisible();
    await expect(screen.getByText(kiosk.ipAddressPortPrinter, { exact: true })).toBeVisible();

    // Konfigurasi printer perangkat dipakai pada bukti cetak kiosk.
    await browser.evaluate(() => {
      const target = window as unknown as { __cetak?: number };
      target.__cetak = 0;
      window.print = () => {
        target.__cetak = (target.__cetak ?? 0) + 1;
      };
    });
    await screen.getByRole("button", { name: "Cetak bukti" }).tap();
    expect(
      await browser.evaluate(() => (window as unknown as { __cetak?: number }).__cetak ?? 0),
    ).toBe(1);
    await expect.poll(() => anjungan.jumlahPermohonan()).toBe(1);

    // Perangkat yang tidak mengizinkan surat tanpa akun harus 404.
    await app.open("/desa/anjungan");
    await pasangPerangkat(browser, kiosk.uuidTanpaIzin);
    await app.open("/desa/anjungan/permohonan");
    await expect(screen.getByText("Halaman tidak ditemukan", { exact: true })).toBeVisible();
  },
);
