import { test as webTest } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

import {
  ambilStatusVerifikasiSurat,
  buatSuratMenungguKadesUji,
  hapusSuratDariId,
} from "./support/database";
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

    // Pesan sukses saja tidak cukup: pastikan status tersimpan dan terlihat.
    const setelahOperator = await alur.ambilSuratTerbaru();
    expect(setelahOperator?.status).toBe("verifikasi");
    expect(setelahOperator?.verifikasiOperator).toBe(true);
    expect(setelahOperator?.verifikasiSekdes ?? false).toBe(false);

    await app.open(`/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`);
    await expect(
      screen.getByRole("row").filter({ hasText: alur.namaJenis }).getByText("Menunggu Verifikasi"),
    ).toBeVisible();

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

    const setelahSekdes = await alur.ambilSuratTerbaru();
    expect(setelahSekdes?.verifikasiOperator).toBe(true);
    expect(setelahSekdes?.verifikasiSekdes).toBe(true);
    expect(setelahSekdes?.verifikasiKades ?? false).toBe(false);
    expect(setelahSekdes?.status).toBe("verifikasi");

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

    // 6. Verifikasi DB + pesan yang terlihat pengguna
    const surat = await alur.ambilSuratTerbit();
    expect(surat?.number).toBeDefined();
    expect(surat?.verificationToken).toBeDefined();

    const terbit = await alur.ambilSuratTerbaru();
    expect(terbit?.status).toBe("issued");
    expect(terbit?.verifikasiKades).toBe(true);

    // Admin melihat nomor surat dan status Terbit di daftar.
    await app.open(`/persuratan/surat?q=${encodeURIComponent(alur.namaJenis)}`);
    const barisTerbit = screen.getByRole("row").filter({ hasText: alur.namaJenis });
    await expect(barisTerbit.getByText("Terbit", { exact: true })).toBeVisible();
    await expect(barisTerbit.getByText(surat!.number!)).toBeVisible();

    // Warga melihat nomor surat dan status Siap Diambil di riwayat permohonan.
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
    await expect(screen.getByText(/Nomor surat:/)).toBeVisible();
    await expect(screen.getByText(surat!.number!).first()).toBeVisible();
    await expect(screen.getByText("Siap Diambil").first()).toBeVisible();
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

    // Verifikasi via DB: menu tersembunyi bukan satu-satunya bukti —
    // state surat harus tetap menunggu verifikasi operator.
    const surat = await alur.ambilSuratTerbit();
    expect(surat).toBeNull(); // Surat belum terbit
    const belumDiverifikasi = await alur.ambilSuratTerbaru();
    expect(belumDiverifikasi?.status).toBe("verifikasi");
    expect(belumDiverifikasi?.verifikasiOperator ?? false).toBe(false);
    expect(belumDiverifikasi?.verifikasiSekdes ?? false).toBe(false);
    expect(belumDiverifikasi?.verifikasiKades ?? false).toBe(false);
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
  "verifikasi berjenjang: warga tanpa izin tidak melihat aksi verifikasi",
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

    // CATATAN: ini menguji RBAC halaman admin, bukan aturan domain
    // "pembuat tidak boleh memverifikasi surat sendiri" (`validateVerification`)
    // yang saat ini tidak dipanggil oleh `verifySuratData`. Alur operator tetap
    // sah karena operator memang pembuat konsep dari permohonan warga.
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

    // Pesan penolakan harus sampai ke pemohon, bukan hanya toast admin.
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
    await expect(screen.getByText("Catatan operator: Data tidak lengkap")).toBeVisible();
    await expect(screen.getByText("Dibatalkan").first()).toBeVisible();

    // Surat kembali ke status draft dan bisa diubah operator.
    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");
    await app.open(urlSurat);
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Ubah" })).toBeVisible();

    const setelahTolak = await alur.ambilSuratTerbaru();
    expect(setelahTolak?.status).toBe("draft");
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

    // Pesan penolakan harus sampai ke pemohon, bukan hanya toast admin.
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
    await expect(screen.getByText("Catatan operator: Format tidak sesuai")).toBeVisible();
    await expect(screen.getByText("Dibatalkan").first()).toBeVisible();

    // Surat kembali ke status draft dan bisa diubah operator.
    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");
    await app.open(urlSurat);
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Ubah" })).toBeVisible();

    const setelahTolak = await alur.ambilSuratTerbaru();
    expect(setelahTolak?.status).toBe("draft");
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

    // Pesan penolakan harus sampai ke pemohon, bukan hanya toast admin.
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
    await expect(screen.getByText("Catatan operator: Kebijakan tidak sesuai")).toBeVisible();
    await expect(screen.getByText("Dibatalkan").first()).toBeVisible();

    // Surat kembali ke status draft dan bisa diubah operator.
    await app.clearState();
    await app.open("/masuk");
    await masukDenganKredensial(screen, browser, alur.operatorUsername, operator.password);
    await expect(browser).toHaveURL("/beranda");
    await app.open(urlSurat);
    await aksiSurat().tap();
    await expect(screen.getByRole("menuitem", { name: "Ubah" })).toBeVisible();

    const setelahTolak = await alur.ambilSuratTerbaru();
    expect(setelahTolak?.status).toBe("draft");
  },
);

test(
  "verifikasi berjenjang: pembuat tidak boleh menyetujui tahap kades",
  { timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const tujuan = `Uji verifikasi sendiri ${Date.now()}`;
    const surat = await buatSuratMenungguKadesUji({
      tujuan,
      createdByUsername: "kades-e2e",
    });

    try {
      await app.clearState();
      await app.open("/masuk");
      const kades = credentials.user("kades-e2e");
      await masukDenganKredensial(screen, browser, "kades-e2e", kades.password);
      await expect(browser).toHaveURL("/beranda");

      await app.open(`/persuratan/surat?q=${encodeURIComponent(tujuan)}`);
      const baris = screen.getByRole("row").filter({ hasText: tujuan });
      await expect(baris).toBeVisible();

      // Menu tetap tampil (RBAC dan urutan lolos); penolakan datang dari aturan
      // own-submission di server, bukan sekadar menyembunyikan tombol.
      await baris.getByRole("button", { name: `Aksi surat ${surat.typeName}` }).tap();
      await screen.getByRole("menuitem", { name: "Verifikasi Kepala Desa" }).tap();
      const dialog = screen.getByRole("alertdialog");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Verifikasi" }).tap();
      await expect(
        dialog.getByText("Anda tidak boleh memverifikasi surat yang Anda buat sendiri."),
      ).toBeVisible({ timeout: 15_000 });

      const status = await ambilStatusVerifikasiSurat(surat.id);
      expect(status?.status).toBe("verifikasi");
      expect(status?.verifikasiKades ?? false).toBe(false);
    } finally {
      await hapusSuratDariId(surat.id);
    }
  },
);
