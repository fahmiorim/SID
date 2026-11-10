import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatInventarisDesaLainUji,
  buatInventarisPublikUji,
  hapusInventarisUji,
} from "./support/database";

// ============================================================================
// OS-OPS-011 — API data publik.
//
// Kontrak yang dibuktikan lewat HTTP nyata (bukan unit test):
// - `/api/publik/informasi` dan `/api/publik/dokumen` memakai paginasi
//   `page`/`pageSize` (bawaan 20, maksimum 100) dan menolak nilai tidak valid
//   dengan `400`.
// - `/api/publik/inventaris` mendukung `search` dan hanya membaca data desa
//   pemilik host.
// - `/api/publik/surat` mengembalikan agenda (dibatasi `limit`) dan jenis surat.
// - `/api/publik/openapi` menyajikan kontrak OpenAPI 3.1 dengan `servers`
//   dari origin permintaan dan seluruh jalur data publik.
// - Rate limit 60 permintaan/menit per IP per endpoint menghasilkan `429`.
// ============================================================================

test("API publik informasi: paginasi dokumen dan penolakan parameter salah", async ({
  app,
  browser,
}) => {
  await app.open("/");

  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/informasi?page=1&pageSize=1");
    return {
      status: r.status,
      contentType: r.headers.get("content-type"),
      body: await r.json(),
    };
  });

  expect(res.status).toBe(200);
  expect(res.contentType).toContain("application/json");
  expect(res.body.success).toBe(true);
  expect(res.body.data.profilDesa).toBeTruthy();
  expect(Array.isArray(res.body.data.berita)).toBe(true);
  expect(Array.isArray(res.body.data.dokumen)).toBe(true);
  expect(res.body.data.dokumen.length).toBeLessThanOrEqual(1);

  const halaman = res.body.data.dokumenPagination;
  expect(halaman.page).toBe(1);
  expect(halaman.pageSize).toBe(1);
  expect(halaman.totalPages).toBe(Math.ceil(halaman.totalItems / 1));

  const salah = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/informasi?pageSize=101");
    return { status: r.status, body: await r.json() };
  });
  expect(salah.status).toBe(400);
  expect(salah.body.success).toBe(false);
  expect(String(salah.body.error)).toContain("pageSize");
});

test("API publik dokumen: data tetap array, paginasi konsisten, filter tidak valid ditolak", async ({
  app,
  browser,
}) => {
  await app.open("/");

  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/dokumen?page=1&pageSize=2");
    return { status: r.status, body: await r.json() };
  });
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data.length).toBeLessThanOrEqual(2);
  expect(res.body.pagination.page).toBe(1);
  expect(res.body.pagination.pageSize).toBe(2);
  expect(res.body.pagination.totalPages).toBe(Math.ceil(res.body.pagination.totalItems / 2));

  const kategori = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/dokumen?kategori=ngawur");
    return { status: r.status, body: await r.json() };
  });
  expect(kategori.status).toBe(400);
  expect(String(kategori.body.error)).toContain("Kategori");

  const halaman = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/dokumen?page=0");
    return { status: r.status, body: await r.json() };
  });
  expect(halaman.status).toBe(400);
});

test("API publik inventaris: pencarian dan isolasi tenant dari host", async ({ app, browser }) => {
  const tanda = Date.now().toString().slice(-8);
  const nama = `Barang API ${tanda}`;
  const namaDesaLain = `Barang Desa Lain ${tanda}`;
  const milik = await buatInventarisPublikUji({ nama, kategori: `Kategori API ${tanda}` });
  const desaLain = await buatInventarisDesaLainUji({
    nama: namaDesaLain,
    kategori: `Kategori Lain ${tanda}`,
  });

  try {
    await app.open("/");

    const res = await browser.evaluate(async (kata) => {
      const r = await fetch(`/api/publik/inventaris?search=${encodeURIComponent(kata as string)}`);
      return { status: r.status, body: await r.json() };
    }, nama);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.items.length).toBe(1);

    const isi = JSON.stringify(res.body.data);
    expect(isi).toContain(nama);
    expect(isi).not.toContain(namaDesaLain);
  } finally {
    await hapusInventarisUji(milik);
    await hapusInventarisUji(desaLain);
  }
});

test("API publik surat: agenda dibatasi limit dan jenis surat tersedia", async ({
  app,
  browser,
}) => {
  await app.open("/");

  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/surat?limit=1");
    return { status: r.status, body: await r.json() };
  });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data.agenda)).toBe(true);
  expect(res.body.data.agenda.length).toBeLessThanOrEqual(1);
  expect(Array.isArray(res.body.data.jenisSurat)).toBe(true);
});

test("API publik OpenAPI: kontrak 3.1 per origin, seluruh jalur, dan rate limit 429", async ({
  app,
  browser,
}) => {
  await app.open("/");

  const kontrak = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/openapi");
    return {
      status: r.status,
      contentType: r.headers.get("content-type"),
      asal: location.origin,
      body: await r.json(),
    };
  });

  expect(kontrak.status).toBe(200);
  expect(kontrak.contentType).toContain("application/json");
  expect(kontrak.body.openapi).toBe("3.1.0");
  expect(kontrak.body.servers[0].url).toBe(kontrak.asal);
  for (const jalur of [
    "/api/publik/informasi",
    "/api/publik/dokumen",
    "/api/publik/inventaris",
    "/api/publik/surat",
    "/api/publik/openapi",
  ]) {
    expect(kontrak.body.paths[jalur]).toBeTruthy();
  }
  expect(kontrak.body.paths["/api/publik/dokumen"].get.responses["429"]).toBeTruthy();
  expect(kontrak.body.components.schemas.Galat.required).toContain("error");

  // Endpoint ini dibatasi 60 permintaan/menit per IP; permintaan ke-61 harus
  // ditolak dengan pesan yang dapat dibaca klien.
  const batas = await browser.evaluate(async () => {
    for (let i = 0; i < 70; i += 1) {
      const r = await fetch(`/api/publik/openapi?uji=${i}`);
      if (r.status === 429) {
        const body = await r.json();
        return { status: r.status, error: String(body.error ?? "") };
      }
    }
    return { status: 0, error: "" };
  });
  expect(batas.status).toBe(429);
  expect(batas.error).toContain("Terlalu banyak");
});
