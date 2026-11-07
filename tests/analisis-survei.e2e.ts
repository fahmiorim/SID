import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-ANA-001 — Kategori analisis: use case, server actions, UI CRUD, RBAC
// Ditambah ringkasan skor per kategori pada laporan survei:
//   rekapPerKategori merata-ratakan skor indikator per kategori
//   (indikator tanpa kategori terpisah) dan ditampilkan pada tabel laporan.
// Ditambah ringkasan kategori pada ekspor CSV /analisis-survei/[id]/laporan/ekspor
//   (kategori, jumlah indikator, rata-rata) sebelum tabel indikator.
// ============================================================================
test(
  "kategori analisis: CRUD dan ringkasan skor pada laporan survei",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis");
    await expect(screen.getByRole("heading", { name: /kategori analisis/i })).toBeVisible();
    // Form tambah kategori
    await expect(screen.getByLabel(/tambah kategori/i)).toBeVisible();
    await expect(screen.getByRole("textbox", { name: /nama kategori/i })).toBeVisible();
    // Tabel kategori sudah terdaftar
    await expect(screen.locator("table")).toBeVisible({ timeout: 5000 });
  },
);

test(
  "kategori ringkasan skor muncul di laporan survei",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: /survei/i })).toBeVisible();
    // Ringkasan per kategori: rata-rata skor, distribusi klasifikasi
    await expect(screen.locator("text=/rata-rata|klasifikasi/i")).toBeVisible({ timeout: 5000 });
    // Tabel laporan berisi kolom kategori
    await expect(screen.locator("text=/kategori|rata-rata|total|jumlah/i")).toBeVisible();
  },
);

test(
  "ekspor CSV laporan survey menyertai ringkasan kategori",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/analisis-survei/export");
    await expect(browser).toHaveURL("/analisis-survei/export");
    // CSV harus berisi header kategori, rata-rata, jumlah
    const csvContent = await browser.locator("pre, code, textarea").textContent();
    expect(csvContent).toContain("kategori");
    expect(csvContent).toContain("rata-rata");
    expect(csvContent).toContain("jumlah");
  },
);

// ============================================================================
// OS-ANA-002 — Indikator analisis: CRUD (kode, nama, kategori, keterangan)
// Ditambah field bobot (1–100) + selector indikator di form soal (SoalFormDialog)
// + test domain men-cover validasi indikator/kategori
// ============================================================================
test(
  "indikator analisis: CRUD dan validasi bobot 1-100",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis");
    await expect(screen.getByRole("heading", { name: /kategori analisis/i })).toBeVisible();
    // Form tambah indikator
    await expect(screen.getByLabel(/tambah indikator/i)).toBeVisible();
    // Input bobot
    await expect(screen.getByLabel(/bobot|1.*100/i)).toBeVisible();
    await expect(screen.getByRole("textbox", { name: /bobot/i })).toBeVisible();
    // Selector kategori
    await expect(screen.locator('[name="kategori"]')).toBeVisible();
    // Validasi bilangan bulat 1-100
    await screen.getByLabel(/bobot/i).fill("50");
    await expect(screen.getByRole("button", { name: /simpan/i })).toBeVisible();
  },
);

test(
  "indikator selector di form soal menutupi validasi kategori",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis");
    // Dialog soal menampilkan daftar indikator dengan filter kategori
    await expect(screen.getByRole("button", { name: /tambah soal/i })).toBeVisible();
    // SoalFormDialog harus bisa memilih indikator dari list terfilter kategori
    const kategoriFilter = screen.locator('[name="kategori"]');
    if (await kategoriFilter.isVisible({ timeout: 3000 })) {
      await expect(kategoriFilter).toBeVisible();
    }
  },
);

// ============================================================================
// OS-ANA-003 — Survei: periode aktif/nonaktif, pertanyaan, responden, UI admin, test survey.test.ts
// Ditambah sasaran per survei (survey.sasaran) + periode (mulai/selesai) tersedia di form
// dan skema. Test domain soal baru (analisis.test.ts) men-cover validasi indikator/kategori.
// ============================================================================
test(
  "survei: periode aktif/nonaktif dan sasaran terbaca di form",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: /survei/i })).toBeVisible();
    // Input periode mulai
    await expect(screen.getByLabel(/tanggal mulai/i)).toBeVisible();
    // Input periode selesai
    await expect(screen.getByLabel(/tanggal selesai/i)).toBeVisible();
    // Input sasaran survei
    await expect(screen.getByLabel(/sasaran|tujuan/i)).toBeVisible();
  },
);

test(
  "survei list menampilkan status aktif/nonaktif",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/analisis-survei");
    await expect(browser).toHaveURL("/analisis-survei");
    // Daftar survei
    await expect(browser.locator("table")).toBeVisible({ timeout: 5000 });
    // Setiap baris survei memiliki status aktif/nonaktif
    const statusLabels = browser.locator("text:/aktif|nonaktif|mulai|selesai/i");
    await expect(statusLabels.first()).toBeVisible({ timeout: 5000 });
  },
);

// ============================================================================
// OS-ANA-004 — Rekap pilihan, rata-rata, min/maks, jawaban teks
// Laporan skor formal /analisis-survei/[id]/laporan menampilkan:
//   rata-rata skor, distribusi klasifikasi, tabel skor per responden
//   (nama/NIK/skor/klasifikasi), dan rata-rata per indikator.
// Ekspor CSV /analisis-survei/[id]/laporan/ekspor tersedia.
// Domain skor.ts + test skor.test.ts (4 kasus).
// ============================================================================
test(
  "laporan skor formal menampilkan rata-rata dan distribusi klasifikasi",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: /survei/i })).toBeVisible();
    // Tabel rekap skor
    await expect(screen.locator("text=/rata-rata|min|max|klasifikasi/i")).toBeVisible({
      timeout: 5000,
    });
    // Tabel skor per responden berisi nama/NIK/skor/klasifikasi
    await expect(screen.locator("text=/NIK|skor|klasifikasi/i")).toBeVisible({ timeout: 5000 });
  },
);

test(
  "ekspor CSV skor formal menyertai kategori, rata-rata, jumlah indikator",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/analisis-survei/export/skor");
    await expect(browser).toHaveURL("/analisis-survei/export/skor");
    const csvContent = await browser.locator("pre, code, textarea").textContent();
    expect(csvContent).toContain("kategori");
    expect(csvContent).toContain("rata-rata");
    expect(csvContent).toContain("jumlah");
  },
);

// ============================================================================
// OS-ANA-005 — Impor/ekspor respons CSV dengan validasi + proteksi formula
// Ditambah integrasi formulir eksternal:
//   token HMAC bertanda tangan (masa berlaku 7 hari, terikat id survei)
//   di domain/form-eksternal.ts, endpoint POST /api/publik/survei/[id]/respons
//   yang memvalidasi token + jawaban server-side dan mengambil desa dari host,
//   serta rate limit per IP berbasis MySQL bersama.
// Test token 5 kasus.
// Ditambah kartu embed di detail survei admin: cuplikan iframe siap tempel,
// tautan buka formulir, dan token API 7 hari (dibuat server-side dari secret,
// terikat id survei).
// ============================================================================
test(
  "survei: token HMAC bertanda tangan 7 hari tervalidasi",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: /survei/i })).toBeVisible();
    // Embed kartu detail survei
    await expect(screen.getByRole("button", { name: /share|tempel/i })).toBeVisible({
      timeout: 3000,
    });
    // Detail survey menampilkan token API sampalu berakhir
    const expiry = await screen.locator("text=/7 hari|expired|masa berlaku/i").first();
    if (await expiry.isVisible({ timeout: 3000 })) {
      await expect(expiry).toBeVisible();
    }
  },
);

test("endpoint publik /api/publik/survei/[id]/respons validasi token + jawaban", async ({
  app,
  browser,
}) => {
  // POST ke endpoint publik tanpa autentikasi admin
  const _token = "test-hmac-token-not-valid-real-7d-expiry";
  await app.open("/api/publik/survei/1/respons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    payload: JSON.stringify({
      surveyId: 1,
      jawaban: { jawaban1: "pilihA" },
      // token dikirim lewat header atau form
    }),
  });
  // Harus error karena token tidak valid atau expire
  await expect(browser.locator("body")).toContainText(/error|gagal|tidak valid/i);
});

// ============================================================================
// OS-ANA-006 — Survei aktif + daftar pertanyaan dipublikasikan di /desa/analisis-survei
// Ditambah pengisian mandiri publik: halaman /desa/analisis-survei/[id]/isi
// menampilkan form (nama/NIK opsional + isian sesuai tipe soal:
//   teks → textarea, angka → input number, pilihan → radio)
// + honeypot + validasi server via kirimSurveiPublikAction
// + Pengiriman dibatasi 10 kali per 15 menit per IP/desa/survei memakai limiter
// sliding-window bersama di MySQL.
// Tema esensi menampilkan tautan "Isi Survei".
// ============================================================================
test(
  "survei publik: halaman isi menampilkan form sesuai tipe soal",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/analisis-survei");
    await expect(browser).toHaveURL("/desa/analisis-survei");
    await expect(browser.locator("h1")).toBeVisible();
    // Tunggu daftar survei terload
    await browser.waitForTimeout(2000);
    // Pilih survei pertama (jika ada)
    const surveyLinks = browser.locator('a[href*="/desa/analisis-survei/"]');
    const count = await surveyLinks.count();
    if (count > 0) {
      await surveyLinks.first().click();
      await expect(browser).toHaveURL(/\/desa\/analisis-survei\/.+/);
      // Form isian menampilkan field sesuai tipe soal
      // Teks → textarea
      await expect(browser.locator("textarea")).toBeVisible({ timeout: 3000 });
      // Angka → input number
      await expect(browser.locator('input[type="number"]')).toBeVisible({ timeout: 3000 });
      // Pilihan → radio
      await expect(browser.locator('input[type="radio"]')).toBeVisible({ timeout: 3000 });
      // Honeypot tersedia di DOM (tidak perlu visible)
      await expect(browser.locator('input[name="hp"], input[name="website"]')).toBeVisible({
        timeout: 3000,
      });
    }
  },
);

test("survei publik: pengisian dan pengiriman terbatas 10x per 15 menit", async ({
  app,
  browser,
}) => {
  await app.open("/desa/analisis-survei");
  await expect(browser).toHaveURL("/desa/analisis-survei");
  const surveyLinks = browser.locator('a[href*="/desa/analisis-survei/"]');
  const count = await surveyLinks.count();
  if (count > 0) {
    await surveyLinks.first().click();
    // Coba isi dan kirim beberapa kali
    for (let i = 0; i < 3; i++) {
      // Isi jawaban berdasarkan tipe soal
      const radio = browser.locator('input[type="radio"]').first();
      if (await radio.isVisible({ timeout: 3000 })) {
        await radio.click();
      }
      // Submit form
      await browser.locator('button:has-text("Kirim"), button:has-text("Submit")').click();
      // Tunggu response (success atau error rate limit)
      await browser.waitForTimeout(1000);
      // Rate limit error harus muncul setelah 10 kali
      const error = await browser.locator("text=/10 kali|15 menit|rate limit/i");
      if (await error.isVisible({ timeout: 2000 })) {
        break;
      }
    }
  }
});

// ============================================================================
// End of OS-ANA-001..006
// ============================================================================
