import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { buatLapakPublikUji, hapusLapakPublikUji } from "./support/database";

// ============================================================================
// OS-WEB-018 — Sitemap, robots, dan metadata halaman publik.
//
// Test ini membuktikan URL absolut dibangun dari host permintaan, konten
// dinamis (produk lapak) ikut masuk sitemap, rute admin tidak pernah
// dipublikasikan, dan setiap halaman publik membawa title/description/OG image
// yang benar-benar dapat diunduh—bukan sekadar tag yang ada.
// ============================================================================

/** Ekstrak seluruh `<loc>` dari XML sitemap. */
function lokasiSitemap(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1] ?? "");
}

test(
  "sitemap.xml: URL absolut per host, konten dinamis, tanpa rute admin",
  { timeout: 90_000 },
  async ({ app, browser }) => {
    const cap = Date.now();
    const fixture = await buatLapakPublikUji({
      nama: `Lapak Sitemap E2E ${cap}`,
      kategori: `Kategori Sitemap E2E ${cap}`,
      produk: [
        {
          nama: `Produk Sitemap E2E ${cap}`,
          harga: "9000.00",
          stok: 1,
        },
      ],
    });

    try {
      await app.open("/sitemap.xml");
      await expect(browser).toHaveURL("/sitemap.xml");
      const isi = await browser.locator("body").textContent();
      const asal = await browser.evaluate(() => location.origin);

      expect(isi).toContain("<urlset");
      const lokasi = lokasiSitemap(isi);
      expect(lokasi.length).toBeGreaterThan(20);

      // Semua URL absolut memakai host permintaan, bukan domain statis.
      for (const url of lokasi) {
        expect(url.startsWith(`${asal}/`) || url === `${asal}/`).toBe(true);
      }
      expect(new Set(lokasi).size).toBe(lokasi.length);

      // Rute publik yang wajib terindeks, termasuk halaman turunan.
      for (const jalur of [
        "/desa/peta",
        "/desa/peta/cetak",
        "/desa/status-des",
        "/desa/pengaduan/lacak",
        "/desa/verifikasi-surat",
        "/desa/kesehatan/kia",
      ]) {
        expect(lokasi).toContain(`${asal}${jalur}`);
      }

      // Konten dinamis milik desa ikut terindeks.
      expect(lokasi).toContain(`${asal}/desa/lapak/${fixture.id}/produk`);

      // Area admin/privat tidak boleh bocor ke sitemap.
      for (const terlarang of ["/beranda", "/masuk", "/pengaturan", "/penduduk"]) {
        expect(lokasi).not.toContain(`${asal}${terlarang}`);
      }
    } finally {
      await hapusLapakPublikUji(fixture);
    }
  },
);

test(
  "robots.txt: origin host, area privat ditolak, sitemap menunjuk host",
  { timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/robots.txt");
    await expect(browser).toHaveURL("/robots.txt");
    const body = await browser.locator("body").textContent();
    const asal = await browser.evaluate(() => location.origin);

    expect(body).toMatch(/User-Agent:\s*\*/i);
    expect(body).toMatch(/Allow:\s*\//i);

    for (const jalur of [
      "/beranda",
      "/masuk",
      "/pengaturan",
      "/penduduk",
      "/permohonan-surat",
      "/api/",
      "/layanan-mandiri",
    ]) {
      expect(body).toContain(`Disallow: ${jalur}`);
    }

    expect(body).toContain(`Sitemap: ${asal}/sitemap.xml`);
  },
);

test(
  "metadata publik: title, description, dan OG image absolut yang termuat",
  { timeout: 90_000 },
  async ({ app, browser }) => {
    await app.open("/");
    const asal = await browser.evaluate(() => location.origin);

    const halaman = [
      { path: "/", judul: "Beranda · Desa Contoh", deskripsi: "Website resmi Desa Contoh" },
      {
        path: "/desa/statistik",
        judul: "Statistik Desa · Desa Contoh",
        deskripsi: "Data kependudukan",
      },
      { path: "/desa/berita", judul: "Berita Desa · Desa Contoh", deskripsi: "Kabar terbaru" },
      {
        path: "/desa/peta",
        judul: "Peta Desa Contoh",
        deskripsi: "Peta interaktif desa Desa Contoh",
      },
    ] as const;

    for (const { path, judul, deskripsi } of halaman) {
      await app.open(path);
      await expect(browser).toHaveURL(path);

      const meta = await browser.evaluate(() => {
        const isi = (pemilih: string) =>
          document.querySelector(pemilih)?.getAttribute("content") ?? "";
        return {
          title: document.title,
          deskripsi: isi('meta[name="description"]'),
          ogTitle: isi('meta[property="og:title"]'),
          ogDeskripsi: isi('meta[property="og:description"]'),
          ogImage: isi('meta[property="og:image"]'),
          ogImageTipe: isi('meta[property="og:image:type"]'),
          ogImageLebar: isi('meta[property="og:image:width"]'),
          ogImageTinggi: isi('meta[property="og:image:height"]'),
        };
      });

      expect(meta.title).toContain(judul);
      expect(meta.title).toContain("Sistem Informasi Desa");
      expect(meta.deskripsi).toContain(deskripsi);
      // OG mengikuti metadata halaman, bukan nilai bawaan aplikasi.
      expect(meta.ogTitle).toBe(meta.title);
      expect(meta.ogDeskripsi).toBe(meta.deskripsi);

      // Gambar OG absolut dari host yang sama dan benar-benar berformat PNG.
      expect(meta.ogImage.startsWith(`${asal}/opengraph-image`)).toBe(true);
      expect(meta.ogImageTipe).toBe("image/png");
      expect(meta.ogImageLebar).toBe("1200");
      expect(meta.ogImageTinggi).toBe("630");

      const gambar = await browser.evaluate(async () => {
        const src =
          document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "";
        const respons = await fetch(src);
        const byte = new Uint8Array(await respons.arrayBuffer());
        return {
          status: respons.status,
          tipe: respons.headers.get("content-type") ?? "",
          magic: Array.from(byte.slice(0, 4)),
        };
      });
      expect(gambar.status).toBe(200);
      expect(gambar.tipe).toContain("image/png");
      // Signature PNG: 0x89 'P' 'N' 'G'.
      expect(gambar.magic).toEqual([137, 80, 78, 71]);
    }
  },
);
