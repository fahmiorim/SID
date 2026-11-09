import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-ANA-001 — Kategori analisis: CRUD lewat `/analisis`.
// ============================================================================
test(
  "kategori analisis: tambah kategori dan tampil di tabel",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis");
    await expect(screen.getByRole("heading", { name: "Analisis" })).toBeVisible();

    const nama = `Kategori E2E ${Date.now()}`;
    await screen.getByRole("button", { name: "Tambah Kategori" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Kategori" })).toBeVisible();
    await screen.getByLabel("Nama kategori").fill(nama);
    await screen.getByLabel("Keterangan").fill("Kategori uji E2E");
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    await expect(screen.getByText("Kategori berhasil ditambahkan.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible({
      timeout: 10_000,
    });
  },
);

// ============================================================================
// OS-ANA-002 — Indikator analisis: kode, nama, kategori, dan bobot 1–100.
// ============================================================================
test(
  "indikator analisis: tambah indikator dengan kategori dan bobot",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis");
    await expect(screen.getByRole("heading", { name: "Analisis" })).toBeVisible();

    const kode = `IND${Date.now().toString().slice(-6)}`;
    const nama = `Indikator E2E ${Date.now()}`;
    await screen.getByRole("button", { name: "Tambah Indikator" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Indikator" })).toBeVisible();
    await expect(screen.getByLabel("Bobot (1–100)")).toBeVisible();
    await screen.getByLabel("Kode").fill(kode);
    await screen.getByLabel("Nama indikator").fill(nama);
    await screen.getByLabel("Bobot (1–100)").fill("50");
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    await expect(screen.getByText("Indikator berhasil ditambahkan.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(screen.getByRole("cell", { name: kode, exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();
  },
);

// ============================================================================
// OS-ANA-003 — Survei: sasaran dan periode pada form, status di daftar.
// ============================================================================
test(
  "survei: buat survei dengan sasaran dan periode",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: "Analisis & Survei" })).toBeVisible();

    const judul = `Survei E2E ${Date.now()}`;
    await screen.getByRole("button", { name: "Buat Survei" }).tap();
    await expect(screen.getByRole("dialog", { name: "Buat Survei" })).toBeVisible();

    await screen.getByLabel("Judul").fill(judul);
    await screen.getByLabel("Sasaran responden").fill("Warga usia produktif");
    await screen.getByLabel("Mulai pengisian").fill("2026-01-01");
    await screen.getByLabel("Akhir pengisian").fill("2026-12-31");
    await screen.getByRole("button", { name: "Buat survei" }).tap();

    const baris = screen.getByRole("row").filter({ hasText: judul });
    await expect(baris).toBeVisible({ timeout: 10_000 });
    await expect(baris.getByText("Aktif", { exact: true })).toBeVisible();
  },
);

// ============================================================================
// OS-ANA-004/005 — Detail survei: rekap jawaban, ekspor, dan kartu embed+tokens.
// ============================================================================
test(
  "survei: detail menampilkan rekap jawaban, ekspor, dan token embed",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: "Analisis & Survei" })).toBeVisible();

    const judul = `Survei Detail E2E ${Date.now()}`;
    await screen.getByRole("button", { name: "Buat Survei" }).tap();
    await screen.getByLabel("Judul").fill(judul);
    await screen.getByRole("button", { name: "Buat survei" }).tap();
    await expect(screen.getByRole("row").filter({ hasText: judul })).toBeVisible({
      timeout: 10_000,
    });

    await screen.getByRole("link", { name: judul }).tap();
    await expect(screen.getByRole("heading", { name: judul })).toBeVisible();
    await expect(screen.getByText("Rekap Jawaban")).toBeVisible();
    await expect(screen.getByText("Ekspor & Impor Respons")).toBeVisible();
    await expect(screen.getByText("Embed di Situs Lain")).toBeVisible();
    await expect(screen.getByText(/Token API \(berlaku 7 hari\)/i)).toBeVisible();
    await expect(screen.getByRole("button", { name: "Salin kode embed" })).toBeVisible();
  },
);

// ============================================================================
// OS-ANA-004 — Ekspor laporan skor menolak id survei tidak valid.
// ============================================================================
test(
  "ekspor CSV laporan survey menolak id survei tidak valid",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/analisis-survei");
    const hasil = await browser.evaluate(async () => {
      const respons = await fetch("/analisis-survei/0/laporan/ekspor");
      return { status: respons.status, body: await respons.text() };
    });
    expect(hasil.status).toBe(400);
    expect(hasil.body).toContain("tidak valid");
  },
);

test(
  "ekspor CSV skor formal menolak id survei tidak valid",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/analisis-survei");
    const hasil = await browser.evaluate(async () => {
      const respons = await fetch("/analisis-survei/0/ekspor");
      return { status: respons.status, body: await respons.text() };
    });
    expect(hasil.status).toBe(400);
    expect(hasil.body).toContain("tidak valid");
  },
);

// ============================================================================
// OS-ANA-005 — Endpoint formulir eksternal menolak permintaan tanpa token.
// ============================================================================
test("endpoint publik /api/publik/survei/[id]/respons menolak tanpa token", async ({
  app,
  browser,
}) => {
  await app.open("/desa/analisis-survei");
  const hasil = await browser.evaluate(async () => {
    const respons = await fetch("/api/publik/survei/1/respons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jawaban: { jawaban1: "pilihA" } }),
    });
    return { status: respons.status, body: await respons.text() };
  });
  expect(hasil.status).toBe(401);
  expect(hasil.body).toMatch(/token/i);
});

// ============================================================================
// OS-ANA-006 — Halaman publik menampilkan survei aktif.
// ============================================================================
test(
  "survei publik: halaman daftar survei dapat diakses",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/analisis-survei");
    await expect(browser).toHaveURL("/desa/analisis-survei");
    await expect(browser.locator("h1")).toBeVisible();
  },
);
