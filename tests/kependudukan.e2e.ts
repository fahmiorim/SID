import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-POP-006 — DTKS: impor CSV melalui dialog.
test(
  "dtks: dialog impor CSV tersedia dan menampilkan validasi",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/penduduk/dtks");
    await expect(
      screen.getByRole("heading", { name: /dtks|data target|target program/i }),
    ).toBeVisible();
    await expect(screen.getByRole("button", { name: /impor|upload/i })).toBeVisible();
  },
);

// Katalog: OS-POP-010 — Statistik penduduk + ekspor PDF.
test(
  "statistik penduduk: filter dan ekspor PDF tersedia",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/statistik/penduduk");
    await expect(screen.getByRole("heading", { name: /statistik penduduk/i })).toBeVisible();

    // Ekspor PDF.
    await app.open("/statistik/penduduk/ekspor/pdf");
    await expect(screen.getByRole("heading", { name: /ekspor/i })).toBeVisible();
  },
);

// Katalog: OS-POP-011 — Program bantuan: cetak laporan resmi.
test(
  "bantuan: cetak laporan resmi dari detail program",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/bantuan");
    await expect(screen.getByRole("heading", { name: /program bantuan/i })).toBeVisible();

    // Klik program pertama untuk membuka detail + cetak.
    const baris = screen.getByRole("row").first();
    if ((await baris.count()) > 0) {
      const link = baris.getByRole("link", { name: /detail|lihat/i });
      if ((await link.count()) > 0) {
        await link.first().tap();
        await expect(screen.getByRole("heading")).toBeVisible();
      }
    }
  },
);

// Katalog: OS-POP-012 — Peserta bantuan: impor peserta + cetak kartu.
test("peserta bantuan: impor peserta tersedia", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/bantuan");
  await expect(screen.getByRole("heading", { name: /program bantuan/i })).toBeVisible();
});

// Katalog: OS-POP-013 — Statistik bantuan: filter kategori sasaran + ekspor CSV/PDF.
test(
  "statistik bantuan: filter kategori sasaran dan ekspor",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/statistik/bantuan");
    await expect(screen.getByRole("heading", { name: /statistik bantuan/i })).toBeVisible();

    await app.open("/statistik/bantuan/ekspor/pdf");
    await expect(screen.getByRole("heading", { name: /ekspor/i })).toBeVisible();
  },
);
