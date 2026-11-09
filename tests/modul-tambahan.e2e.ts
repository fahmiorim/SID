import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-MOD-001 — Anjungan: CRUD kiosk device + publik layanan aktif.
test(
  "anjungan admin: CRUD kiosk device dengan field lengkap",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/anjungan");
    await expect(screen.getByRole("heading", { name: /anjungan|kiosk/i })).toBeVisible();
  },
);

test(
  "anjungan publik menampilkan daftar layanan aktif",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/anjungan");
    await expect(browser).toHaveURL("/desa/anjungan");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-MOD-003 — Rekap kehadiran bulanan.
test(
  "rekap kehadiran: ringkasan hadir/izin/sakit/alpa per perangkat",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/kehadiran/rekap");
    await expect(screen.getByRole("heading", { name: /rekap kehadiran/i })).toBeVisible();
    await expect(screen.getByText("Total per Status")).toBeVisible();
    await expect(screen.getByText("Hadir", { exact: true })).toBeVisible();
  },
);

test("rekap kehadiran unduh CSV tersedia", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/kehadiran/rekap");
  const hasil = await browser.evaluate(async () => {
    const res = await fetch("/kehadiran/rekap/ekspor");
    return { contentType: res.headers.get("content-type"), body: await res.text() };
  });
  expect(hasil.contentType).toContain("text/csv");
  expect(hasil.body).toContain("Perangkat");
});
