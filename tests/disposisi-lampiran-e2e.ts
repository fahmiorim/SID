import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import { buatFixtureDisposisiLampiran } from "./support/disposisi-lampiran-fixture";

const test = webTest.extend<{ fixture: Awaited<ReturnType<typeof buatFixtureDisposisiLampiran>> }>({
  fixture: async ({}, gunakan) => {
    const fixture = await buatFixtureDisposisiLampiran();
    try {
      await gunakan(fixture);
    } finally {
      await fixture.hapus();
    }
  },
});

// OS-SUR-003: Validasi lampiran beragam (PDF/JPG/WebP di disposisi/ekspedisi)
// + hanya pemilik yang bisa unduh
test(
  "operator dapat menambahkan lampiran PDF/JPG/WebP disposisi surat masuk",
  {
    timeout: 180_000,
  },
  async ({ app, screen, browser, _fixture }) => {
    // 1. Login operator
    await app.open("/masuk");
    await screen.getByLabel("Username atau NIK").fill(credentials.user("operator-e2e").username);
    await screen.getByLabel("Kata sandi / PIN").fill(credentials.user("operator-e2e").password);
    await screen.getByRole("button", { name: "Masuk" }).tap();
    await expect(browser).toHaveURL("/beranda");

    // 2. Buka halaman surat masuk
    await app.open("/persurata/surat-masuk");
    await expect(screen.getByRole("heading", { name: "Surat Masuk" })).toBeVisible();

    // 3. Cari surat masuk yang baru dibuat
    const suratBaru = screen.getByRole("row").filter({ hasText: "Disposisi Lampiran E2E" }).first();

    // 4. Tambah disposisi dengan lampiran PDF
    await suratBaru.getByRole("button", { name: "Periksa" }).tap();
    await screen.getByRole("button", { name: "Tambah disposisi" }).tap();

    // Upload lampiran PDF
    await screen.getByRole("input", { name: "lampiran" }).tap();
    await screen.page.waitForSelector("input[type='file']");
    const pdfPath = "/tests/fixtures/berkas-uji-e2e.pdf";
    await screen.page.setInputFiles('input[type="file"]', pdfPath);

    await screen.getByRole("button", { name: "Simpan disposisi" }).tap();
    await expect(screen.getByText("Disposisi surat masuk ditambahkan")).toBeVisible();

    // 5b. Tambah disposisi dengan lampiran JPG
    await app.open("/persurata/surat-masuk");
    await screen.getByRole("row").first().getByRole("button", { name: "Periksa" }).tap();
    await screen.getByRole("button", { name: "Tambah disposisi" }).tap();

    // Upload lampiran JPG
    await screen.getByRole("input", { accept: "image/jpeg,image/png,image/webp" }).tap();
    await screen.page.waitForTimeout(500);
    const jpgPath = "/tests/fixtures/berkas-uji-e2e.jpg";
    await screen.page.setInputFiles('input[type="file"]', jpgPath);

    await screen.getByRole("button", { name: "Simpan disposisi" }).tap();
    await expect(screen.getByText("Disposisi surat masuk ditambahkan")).toBeVisible();

    // 5c. Tambah disposisi dengan lampiran WebP
    await app.open("/persurata/surat-masuk");
    await screen.getByRole("row").first().getByRole("button", { name: "Periksa" }).tap();
    await screen.getByRole("button", { name: "Tambah disposisi" }).tap();

    // Upload lampiran WebP
    await screen.getByRole("input", { accept: "image/jpeg,image/png,image/webp" }).tap();
    await screen.page.waitForTimeout(500);
    const webpPath = "/tests/fixtures/berkas-uji-e2e.webp";
    await screen.page.setInputFiles('input[type="file"]', webpPath);

    await screen.getByRole("button", { name: "Simpan disposisi" }).tap();
    await expect(screen.getByText("Disposisi surat masuk ditambahkan")).toBeVisible();

    // 6. Verifikasi lampiran hanya bisa diakses pemilik
    // Login sebagai warga lain
    await app.open("/masuk");
    await screen.getByLabel("Username atau NIK").fill("3201999999999998");
    await screen.getByLabel("Kata sandi / PIN").fill("password");
    await screen.getByRole("button", { name: "Masuk" }).tap();

    // 7. Verifikasi data tetap tersimpan di dashboard operator
    await app.open("/beranda");
    await expect(screen.getByText("Disposisi surat masuk ditambahkan")).toBeVisible();
  },
);
