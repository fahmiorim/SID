import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-POP-010 — Statistik penduduk `/statistik/penduduk`, rentang umur, filter
// wilayah/umur, ekspor CSV, cetak browser, dan ekspor PDF
// `/statistik/penduduk/ekspor/pdf`. **Gap: E2E khusus ekspor PDF.**
// E2E `statistik-bantuan.e2e.ts` sudah ada tes halaman utama; file ini
// memfokuskan pada ekspor PDF dan otorisasi.
// ============================================================================
test(
  "OS-POP-010: statistik penduduk ekspor PDF — admin mendapatkan PDF",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");
    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");

    // Verifikasi isi PDF (awalan %PDF-)
    const pdfHeader = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf");
      const buf = await res.arrayBuffer();
      return new TextDecoder().decode(new Uint8Array(buf.slice(0, 5)));
    });
    expect(pdfHeader).toBe("%PDF-");
  },
);

test(
  "OS-POP-010: statistik penduduk ekspor PDF — kind tak dikenal tetap mengembalikan PDF (menggunakan bawaan)",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");
    const status = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf?kind=hantu");
      return res.status;
    });
    expect(status).toBe(200);

    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf?kind=hantu");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");
  },
);

test(
  "OS-POP-010: statistik penduduk ekspor PDF — tanpa sesi mengembalikan 401",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    // State bersih tanpa session
    await app.open("/masuk");
    const status = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf");
      return res.status;
    });
    expect(status).toBe(401);
  },
);

test(
  "OS-POP-010: statistik penduduk ekspor PDF — sesi warga tanpa izin mengembalikan 403",
  { session: "warga-e2e", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/penduduk");
    const status = await browser.evaluate(async () => {
      const res = await fetch("/statistik/penduduk/ekspor/pdf");
      return res.status;
    });
    expect(status).toBe(403);
  },
);

// ============================================================================
// OS-POP-013 — Statistik bantuan per program/sasaran, filter wilayah/periode,
// ekspor CSV, cetak browser, dan ekspor PDF `/statistik/bantuan/ekspor/pdf`.
// Filter **kategori sasaran** tersedia di halaman dan diteruskan ke ekspor
// CSV/PDF; tombol Unduh PDF ditautkan ke rute nyata.
// **Gap: E2E ekspor PDF.** Test `statistik.test.ts`; E2E `statistik-bantuan.e2e.ts`.
// ============================================================================
test(
  "OS-POP-013: statistik bantuan ekspor PDF — admin mendapatkan PDF",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan");
    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");

    const pdfHeader = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf");
      const buf = await res.arrayBuffer();
      return new TextDecoder().decode(new Uint8Array(buf.slice(0, 5)));
    });
    expect(pdfHeader).toBe("%PDF-");
  },
);

test(
  "OS-POP-013: statistik bantuan ekspor PDF — kind tak dikenal tetap mengembalikan PDF (menggunakan bawaan)",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan");
    const status = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf?kind=hantu");
      return res.status;
    });
    expect(status).toBe(200);

    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf?kind=hantu");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");
  },
);

test(
  "OS-POP-013: statistik bantuan ekspor PDF — tanpa sesi mengembalikan 401",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/masuk");
    const status = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf");
      return res.status;
    });
    expect(status).toBe(401);
  },
);

test(
  "OS-POP-013: statistik bantuan ekspor PDF — sesi warga tanpa izin mengembalikan 403",
  { session: "warga-e2e", tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/statistik/bantuan");
    const status = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf");
      return res.status;
    });
    expect(status).toBe(403);
  },
);

test(
  "OS-POP-013: statistik bantuan ekspor PDF — filter kategori sasaran diteruskan ke URL tombol unduh",
  { session: "admin", tags: ["smoke"] },
  async ({ app, browser }) => {
    // Buka halaman statistik bantuan dengan filter kind=sasaran dan sasaran=1 (penduduk)
    await app.open("/statistik/bantuan?kind=sasaran&sasaran=1");

    // Verifikasi filter sasaran terlihat di UI
    await expect(browser.locator('[name="sasaran"]')).toBeVisible({ timeout: 3000 });

    // Verifikasi URL ekspor PDF mengandung parameter filter yang sama
    const pdfHref = await browser.evaluate(async () => {
      // Ambil href dari tombol Unduh PDF (link yang mengarah ke /statistik/bantuan/ekspor/pdf)
      const link = document.querySelector('a[href*="/statistik/bantuan/ekspor/pdf"]');
      return link?.getAttribute("href");
    });

    expect(pdfHref).toContain("kind=sasaran");
    expect(pdfHref).toContain("sasaran=1");

    // Fetch PDF dengan parameter filter yang sama
    const cd = await browser.evaluate(async () => {
      const res = await fetch("/statistik/bantuan/ekspor/pdf?kind=sasaran&sasaran=1");
      return res.headers.get("content-type");
    });
    expect(cd).toContain("application/pdf");
  },
);
