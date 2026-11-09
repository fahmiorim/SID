import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Katalog: OS-POP-010 — Statistik penduduk: ekspor PDF berisi dokumen PDF.
 */
test("statistik penduduk: ekspor PDF", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/statistik/penduduk");
  const hasil = await browser.evaluate(async () => {
    const res = await fetch("/statistik/penduduk/ekspor/pdf");
    const buf = await res.arrayBuffer();
    return {
      status: res.status,
      type: res.headers.get("content-type"),
      awalan: new TextDecoder().decode(new Uint8Array(buf.slice(0, 5))),
    };
  });
  expect(hasil.status).toBe(200);
  expect(hasil.type).toContain("application/pdf");
  expect(hasil.awalan).toBe("%PDF-");
});

/**
 * Katalog: OS-POP-010 — `kind` tak dikenal memakai jenis bawaan, tetap PDF.
 */
test(
  "statistik penduduk: kind tak dikenal tetap mengembalikan PDF",
  { session: "admin" },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");
    const hasil = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf?kind=hantu");
      return { status: res.status, type: res.headers.get("content-type") };
    });
    expect(hasil.status).toBe(200);
    expect(hasil.type).toContain("application/pdf");
  },
);

/**
 * Katalog: OS-POP-013 — Statistik bantuan: ekspor PDF dan filter sasaran.
 */
test("statistik bantuan: ekspor PDF", { session: "admin" }, async ({ app, browser }) => {
  await app.open("/statistik/bantuan");
  const hasil = await browser.evaluate(async () => {
    const res = await fetch("/statistik/bantuan/ekspor/pdf?kind=sasaran&sasaran=1");
    const buf = await res.arrayBuffer();
    return {
      status: res.status,
      type: res.headers.get("content-type"),
      awalan: new TextDecoder().decode(new Uint8Array(buf.slice(0, 5))),
    };
  });
  expect(hasil.status).toBe(200);
  expect(hasil.type).toContain("application/pdf");
  expect(hasil.awalan).toBe("%PDF-");
});

/**
 * Katalog: OS-POP-013 — Tautan Unduh PDF membawa filter halaman.
 */
test(
  "statistik bantuan: tautan PDF membawa filter sasaran",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/statistik/bantuan?kind=sasaran&sasaran=1");
    const href = await screen.getByRole("link", { name: /Unduh PDF/ }).getAttribute("href");
    expect(href).toContain("/statistik/bantuan/ekspor/pdf?");
    expect(href).toContain("kind=sasaran");
    expect(href).toContain("sasaran=1");
  },
);

/**
 * Katalog: OS-POP-010/013 — Tanpa sesi, ekspor PDF tidak boleh terbuka.
 */
test("ekspor PDF statistik menolak tanpa sesi", async ({ app, browser }) => {
  await app.open("/masuk");
  const hasil = await browser.evaluate(async () => {
    const res = await fetch("/statistik/penduduk/ekspor/pdf");
    return { status: res.status, type: res.headers.get("content-type") ?? "" };
  });
  expect(hasil.type).not.toContain("application/pdf");
  expect([401, 200]).toContain(hasil.status);
});

/**
 * Katalog: OS-POP-010/013 — Sesi warga (tanpa izin statistik) tidak mendapat PDF.
 */
test(
  "ekspor PDF statistik ditolak untuk sesi warga",
  { session: "warga-e2e" },
  async ({ app, browser }) => {
    await app.open("/beranda");
    const hasil = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf");
      return { status: res.status, type: res.headers.get("content-type") ?? "" };
    });
    expect(hasil.type).not.toContain("application/pdf");
  },
);
