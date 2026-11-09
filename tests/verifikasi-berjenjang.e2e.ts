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
 * Katalog: OS-SUR-007 — Verifikasi Berjenjang Peran
 *
 * Menguji:
 * - Alur normal: operator → sekdes → kades → surat terbit
 * - Restriksi peran: lompat step, approve ganda, approve own submission
 * - Penolakan di setiap tahap
 */
test(
  "verifikasi berjenjang: alur normal operator → sekdes → kades",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();

    // 1. Login sebagai warga dan buat permohonan surat
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Uji berjenjang ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    // 2. Login operator: verifikasi step 1
    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open("/permohonan-surat?status=1");
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });

    // Verifikasi Operator (step 1)
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Verifikasi Operator" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();
    await expect(screen.getByText("Surat diverifikasi.")).toBeVisible();
    await app.open(urlSurat);

    // 3. Login sekdes: verifikasi step 2
    await app.clearState();
    await app.open("/masuk");
    const sekdes = credentials.user("sekdes-e2e");
    await masukDenganKredensial(screen, browser, "sekdes-e2e", sekdes.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open(urlSurat);

    // Verifikasi Sekretaris Desa (step 2)
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Verifikasi Sekretaris Desa" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();
    await expect(screen.getByText("Surat diverifikasi.")).toBeVisible();
    await app.open(urlSurat);

    // 4. Login kades: verifikasi step 3 → surat terbit
    await app.clearState();
    await app.open("/masuk");
    const kades = credentials.user("kades-e2e");
    await masukDenganKredensial(screen, browser, "kades-e2e", kades.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open(urlSurat);

    // Verifikasi Kepala Desa (step 3) → terbit
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Verifikasi Kepala Desa" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();
    await expect(screen.getByText(/Surat terverifikasi dan terbit dengan nomor/)).toBeVisible();
    await app.open(urlSurat);

    // 5. Verifikasi: surat terbit, menu Unduh PDF tersedia
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Unduh PDF" })).toBeVisible();

    // 6. Verifikasi DB: surat terbit dengan token
    const surat = await alur.ambilSuratTerbit();
    expect(surat?.number).toBeDefined();
    expect(surat?.verificationToken).toBeDefined();
  },
);

test(
  "verifikasi berjenjang: restriksi — lompat step ditolak",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();

    // Setup: warga buat permohonan
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Uji lompat step ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    // Login operator: buat konsep
    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open("/permohonan-surat?status=1");
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });

    // Login sekdes: coba lompat ke step kades (should fail)
    await app.clearState();
    await app.open("/masuk");
    const sekdes = credentials.user("sekdes-e2e");
    await masukDenganKredensial(screen, browser, "sekdes-e2e", sekdes.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open(urlSurat);

    // Sekdes tidak bisa verifikasi karena step berikutnya adalah operator
    // UI tidak menampilkan menu verifikasi untuk sekdes
    await aksiSurat().tap();
    await expect(
      screen.getByRole("menuitem", { name: "Verifikasi Sekretaris Desa" }),
    ).not.toBeVisible();
    await expect(
      screen.getByRole("menuitem", { name: "Verifikasi Kepala Desa" }),
    ).not.toBeVisible();

    // Verifikasi via DB: step operator belum selesai
    const surat = await alur.ambilSuratTerbit();
    expect(surat).toBeNull(); // Surat belum terbit
  },
);

test(
  "verifikasi berjenjang: restriksi — approve ganda ditolak",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();

    // Setup: warga buat permohonan
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Uji approve ganda ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    // Login operator: buat konsep & verifikasi step 1
    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open("/permohonan-surat?status=1");
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });

    // Operator verifikasi step 1
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Verifikasi Operator" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();
    await expect(screen.getByText("Surat diverifikasi.")).toBeVisible();
    await app.open(urlSurat);

    // Operator coba verifikasi lagi (should fail — step berikutnya adalah sekdes)
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Verifikasi Operator" })).not.toBeVisible();
    await expect(
      screen.getByRole("menuitem", { name: "Verifikasi Sekretaris Desa" }),
    ).not.toBeVisible();
  },
);

test(
  "verifikasi berjenjang: restriksi — approve own submission ditolak",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();

    // Setup: warga buat permohonan
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Uji own submission ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    // Login operator: buat konsep
    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open("/permohonan-surat?status=1");
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);

    // Login warga (pemohon): tidak bisa verifikasi surat sendiri
    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    // Warga tidak punya akses ke halaman admin persuratan
    await app.open(urlSurat);
    // Warga di-redirect atau tidak melihat aksi verifikasi sama sekali.
    const aksiWarga = screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });
    expect(await aksiWarga.count()).toBe(0);
  },
);

test(
  "verifikasi berjenjang: tolak verifikasi di step operator",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();

    // Setup: warga buat permohonan
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Uji tolak operator ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    // Login operator: buat konsep & tolak
    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open("/permohonan-surat?status=1");
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });

    // Operator tolak surat
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Tolak & Kembalikan ke Konsep" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByLabel("Alasan penolakan").fill("Data tidak lengkap");
    await screen.getByRole("button", { name: "Tolak" }).tap();
    await expect(screen.getByText("Surat ditolak.")).toBeVisible();

    // Verifikasi: surat kembali ke status draft
    await app.open(urlSurat);
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Ubah" })).toBeVisible();
  },
);

test(
  "verifikasi berjenjang: tolak verifikasi di step sekdes",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();

    // Setup: warga buat permohonan
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Uji tolak sekdes ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    // Login operator: buat konsep & verifikasi step 1
    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open("/permohonan-surat?status=1");
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });

    // Operator verifikasi step 1
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Verifikasi Operator" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();
    await expect(screen.getByText("Surat diverifikasi.")).toBeVisible();
    await app.open(urlSurat);

    // Login sekdes: tolak surat
    await app.clearState();
    await app.open("/masuk");
    const sekdes = credentials.user("sekdes-e2e");
    await masukDenganKredensial(screen, browser, "sekdes-e2e", sekdes.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open(urlSurat);

    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Tolak & Kembalikan ke Konsep" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByLabel("Alasan penolakan").fill("Format tidak sesuai");
    await screen.getByRole("button", { name: "Tolak" }).tap();
    await expect(screen.getByText("Surat ditolak.")).toBeVisible();

    // Verifikasi: surat kembali ke status draft
    await app.open(urlSurat);
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Ubah" })).toBeVisible();
  },
);

test(
  "verifikasi berjenjang: tolak verifikasi di step kades",
  { timeout: 180_000 },
  async ({ app, screen, browser, alur }) => {
    await app.clearState();

    // Setup: warga buat permohonan
    await app.open("/masuk");
    await masukDenganKredensial(
      screen,
      browser,
      alur.warga.nik,
      credentials.user("warga-e2e").password,
    );
    await expect(browser).toHaveURL("/layanan-mandiri/beranda");

    await app.open(`/layanan-mandiri/surat?jenis=${alur.jenisId}`);
    await screen.getByLabel("Keterangan").fill(`Uji tolak kades ${alur.warga.nik}`);
    await screen
      .getByLabel(new RegExp(alur.syaratNama))
      .setInputFiles("tests/fixtures/berkas-uji-e2e.pdf");
    await screen.getByRole("button", { name: "Kirim permohonan" }).tap();
    await expect(screen.getByText("Permohonan berhasil dikirim")).toBeVisible();

    // Login operator: buat konsep & verifikasi step 1
    await app.clearState();
    await app.open("/masuk");
    const operator = credentials.user("warga-e2e-operator");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open("/permohonan-surat?status=1");
    const permohonan = screen.getByRole("row").filter({ hasText: alur.warga.nik });
    await permohonan.getByRole("button", { name: "Periksa" }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Buat konsep & ajukan verifikasi" }).tap();
    // Tunggu Server Action selesai sebelum pindah halaman.
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 15_000 });

    const urlSurat = `/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`;
    await app.open(urlSurat);
    const aksiSurat = () => screen.getByRole("button", { name: `Aksi surat ${alur.namaJenis}` });

    // Operator verifikasi step 1
    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Verifikasi Operator" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();
    await expect(screen.getByText("Surat diverifikasi.")).toBeVisible();
    await app.open(urlSurat);

    // Login sekdes: verifikasi step 2
    await app.clearState();
    await app.open("/masuk");
    const sekdes = credentials.user("sekdes-e2e");
    await masukDenganKredensial(screen, browser, "sekdes-e2e", sekdes.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open(urlSurat);

    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Verifikasi Sekretaris Desa" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByRole("button", { name: "Verifikasi" }).tap();
    await expect(screen.getByText("Surat diverifikasi.")).toBeVisible();
    await app.open(urlSurat);

    // Login kades: tolak surat
    await app.clearState();
    await app.open("/masuk");
    const kades = credentials.user("kades-e2e");
    await masukDenganKredensial(screen, browser, "kades-e2e", kades.password);
    await expect(browser).toHaveURL("/beranda");

    await app.open(urlSurat);

    await aksiSurat().tap();
    await screen.getByRole("menuitem", { name: "Tolak & Kembalikan ke Konsep" }).tap();
    await expect(screen.getByRole("alertdialog")).toBeVisible();
    await screen.getByLabel("Alasan penolakan").fill("Kebijakan tidak sesuai");
    await screen.getByRole("button", { name: "Tolak" }).tap();
    await expect(screen.getByText("Surat ditolak.")).toBeVisible();

    // Verifikasi: surat kembali ke status draft
    await app.open(urlSurat);
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Ubah" })).toBeVisible();
  },
);
