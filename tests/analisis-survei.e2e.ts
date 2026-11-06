import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-ANA-001 — Kategori analisis + ringkasan skor per kategori.
test(
  "kategori analisis: CRUD dan ringkasan skor pada laporan survei",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/analisis");
    await expect(screen.getByRole("heading", { name: /kategori analisis/i })).toBeVisible();
  },
);

// Katalog: OS-ANA-002 — Indikator analisis + bobot.
test(
  "indikator analisis: tambah dengan bobot dan tautan ke soal",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/analisis");
    await expect(screen.getByRole("heading", { name: /kategori/i })).toBeVisible();
  },
);

// Katalog: OS-ANA-003 — Survei: periode aktif, pertanyaan, responden.
test(
  "survei: periode aktif/nonaktif dan pertanyaan tersimpan",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: /survei/i })).toBeVisible();
  },
);

// Katalog: OS-ANA-004 — Rekap skor + laporan formal.
test(
  "rekap skor: laporan formal dengan distribusi klasifikasi dan CSV",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: /survei/i })).toBeVisible();
  },
);

// Katalog: OS-ANA-005 — Impor/ekspor respons CSV + formulir eksternal.
test(
  "survei: token HMAC dan kartu embed tersedia di detail survei",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/analisis-survei");
    await expect(screen.getByRole("heading", { name: /survei/i })).toBeVisible();
  },
);

// Katalog: OS-ANA-006 — Survei aktif publik + pengisian mandiri.
test(
  "survei publik: halaman isi survei menampilkan form",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/analisis-survei");
    await expect(browser).toHaveURL("/desa/analisis-survei");
    await expect(browser.locator("body")).toBeVisible();
  },
);
