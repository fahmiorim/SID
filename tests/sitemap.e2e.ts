import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-WEB-018 — Sitemap dinamis per host, robots.txt, metadata per route, OG image per host.
// Cakupan URL dinamis meliputi pengaduan, lapak (katalog + produk per lapak), kesehatan, pertanahan, peta, kontak, verifikasi surat.
// Halaman lapak dan produk memakai metadata Open Graph; katalog lapak publik menghindari N+1 dengan produkCount di kueri tunggal.
// **Gap: E2E.**.
// ============================================================================
test("sitemap.xml: URL dinamis per host tersedia", async ({ app, browser }) => {
  await app.open("/sitemap.xml");
  await expect(browser).toHaveURL("/sitemap.xml");
  const body = await browser.locator("body").textContent();
  expect(body).toContain("<urlset");
  // URL dinamis yang wajib ada
  const requiredUrls = [
    "/desa/pengaduan",
    "/desa/lapak",
    "/desa/kesehatan",
    "/desa/pertanahan",
    "/desa/peta",
    "/desa/kontak",
    "/desa/verifikasi-surat",
  ];
  for (const url of requiredUrls) {
    expect(body).toContain(url);
  }
});

test("robots.txt: halaman publik diizinkan, admin ditolak", async ({ app, browser }) => {
  await app.open("/robots.txt");
  await expect(browser).toHaveURL("/robots.txt");
  const body = await browser.locator("body").textContent();
  // Teks robots dirender satu baris oleh browser (baris baru jadi spasi).
  expect(body).toMatch(/user-agent:\s*\*/i);
  expect(body).toMatch(/allow:\s*\//i);
  // Admin routes disallowed
  expect(body).toMatch(/disallow:\s*\/beranda/i);
  expect(body).toMatch(/disallow:\s*\/masuk/i);
  expect(body).toMatch(/disallow:\s*\/pengaturan/i);
  expect(body).toMatch(/disallow:\s*\/api\//i);
  // Sitemap reference
  expect(body).toMatch(/sitemap:\s*https?:\/\//i);
});
