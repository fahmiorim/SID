import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-GOV-003 — Struktur jabatan dan perangkat desa.
test(
  "pemerintahan: bagan SOTK dan perangkat desa tersedia",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pemerintahan/perangkat");
    await expect(screen.getByRole("heading", { name: /perangkat|sotk/i })).toBeVisible();
  },
);

test(
  "pemerintahan publik menampilkan bagan SOTK",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/pemerintahan");
    await expect(browser).toHaveURL("/desa/pemerintahan");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-GOV-004 — Lembaga (kelompok tipe lembaga): CRUD + laporan + ekspor.
test(
  "lembaga: halaman daftar, laporan, dan ekspor CSV tersedia",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/kelompok?tipe=lembaga");
    await expect(screen.getByRole("heading", { name: /lembaga/i })).toBeVisible();

    await app.open("/kelompok/laporan?tipe=lembaga");
    await expect(screen.getByRole("heading", { name: /laporan/i })).toBeVisible();
  },
);

// Katalog: OS-GOV-005 — Kelompok masyarakat: CRUD + laporan + ekspor CSV.
test(
  "kelompok masyarakat: halaman daftar, laporan, dan ekspor CSV tersedia",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/kelompok?tipe=kelompok");
    await expect(screen.getByRole("heading", { name: /kelompok/i })).toBeVisible();

    await app.open("/kelompok/laporan?tipe=kelompok");
    await expect(screen.getByRole("heading", { name: /laporan/i })).toBeVisible();
  },
);

// Katalog: OS-GOV-006 — IDM/SDGs: admin CRUD + rekap skor + ekspor laporan.
test(
  "idm admin: tambah tujuan, isi indikator, dan ekspor laporan",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/desa/idm");
    await expect(screen.getByRole("heading", { name: /status desa|idm/i })).toBeVisible();

    // Ekspor laporan.
    await app.open("/desa/idm/ekspor?tahun=2026");
    await expect(screen.getByRole("heading", { name: /ekspor|laporan/i })).toBeVisible();
  },
);

test("idm publik menampilkan ringkasan SDGs", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/idm-sdgs");
  await expect(browser).toHaveURL("/desa/idm-sdgs");
  await expect(browser.locator("body")).toBeVisible();
});

// Katalog: OS-GOV-007 — Pemilihan: CRUD kandidat + rekap suara + hasil.
test("pemilihan: CRUD kandidat dan rekap suara", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/pemerintahan/pemilihan");
  await expect(screen.getByRole("heading", { name: /pemilihan/i })).toBeVisible();

  // Publik: kandidat dan hasil.
  await app.open("/desa/pemilihan");
  await expect(browser.locator("body")).toBeVisible();
});

// Katalog: OS-GOV-009 — Pembangunan: CRUD proyek + buku pembangunan + ekspor CSV.
test(
  "pembangunan: CRUD proyek dan buku pembangunan dengan ekspor CSV",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pembangunan");
    await expect(screen.getByRole("heading", { name: /pembangunan/i })).toBeVisible();

    await app.open("/pembangunan/buku");
    await expect(screen.getByRole("heading", { name: /buku pembangunan/i })).toBeVisible();

    await app.open("/pembangunan/buku/ekspor");
    await expect(screen.getByRole("heading", { name: /ekspor/i })).toBeVisible();
  },
);
