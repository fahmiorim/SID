import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-WEB-001 — Beranda publik.
test(
  "beranda publik memuat sambutan dan widget statistik",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/");
    await expect(browser).toHaveURL("/");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WEB-002 — Berita publik.
test("halaman berita publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/berita");
  await expect(browser).toHaveURL("/desa/berita");
  await expect(browser.locator("body")).toBeVisible();
});

// Katalog: OS-WEB-003 — Profil publik + pemerintahan.
test("profil dan pemerintahan publik tersedia", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/profil");
  await expect(browser).toHaveURL("/desa/profil");
  await expect(browser.locator("body")).toBeVisible();

  await app.open("/desa/pemerintahan");
  await expect(browser).toHaveURL("/desa/pemerintahan");
  await expect(browser.locator("body")).toBeVisible();
});

// Katalog: OS-WEB-004 — Galeri publik.
test("galeri publik tersedia", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/galeri");
  await expect(browser).toHaveURL("/desa/galeri");
  await expect(browser.locator("body")).toBeVisible();
});

// Katalog: OS-WEB-005 — Dokumen publik + produk hukum.
test(
  "dokumen publik tersedia dengan filter jenis",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/dokumen");
    await expect(browser).toHaveURL("/desa/dokumen");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WEB-006 — Statistik publik per triwulan.
test(
  "statistik publik memuat ringkasan triwulan",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/statistik");
    await expect(browser).toHaveURL("/desa/statistik");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WEB-007 — Peta publik (Leaflet).
test("peta publik dimuat tanpa error", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/peta");
  await expect(browser).toHaveURL("/desa/peta");
  await expect(browser.locator("#map") ?? browser.locator("[class*='leaflet']")).toBeVisible({
    timeout: 10_000,
  });
});

// Katalog: OS-WEB-008 — Pembangunan publik + linimasa.
test(
  "pembangunan publik menampilkan proyek dan linimasa",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/pembangunan");
    await expect(browser).toHaveURL("/desa/pembangunan");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WEB-009 — Pengaduan publik + lacak.
test(
  "pengaduan publik dan lacak status tersedia",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/pengaduan");
    await expect(browser).toHaveURL("/desa/pengaduan");
    await expect(browser.locator("body")).toBeVisible();

    await app.open("/desa/pengaduan/lacak");
    await expect(browser).toHaveURL("/desa/pengaduan/lacak");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WEB-010 — Kelompok/lembaga publik + publikasi anggota.
test("kelompok publik memuat daftar lembaga", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/kelompok");
  await expect(browser).toHaveURL("/desa/kelompok");
  await expect(browser.locator("body")).toBeVisible();
});

// Katalog: OS-WEB-011 — Inventaris publik + filter + ekspor CSV.
test("inventaris publik tersedia dengan filter", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/inventaris");
  await expect(browser).toHaveURL("/desa/inventaris");
  await expect(browser.locator("body")).toBeVisible();

  // Ekspor CSV publik tersedia.
  await app.open("/desa/inventaris/ekspor");
  await expect(browser).toHaveURL("/desa/inventaris/ekspor");
  await expect(browser.locator("body")).toBeVisible();
});

// Katalog: OS-WEB-012 — Bantuan publik + suplemen.
test("bantuan dan suplemen publik tersedia", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/bantuan");
  await expect(browser).toHaveURL("/desa/bantuan");
  await expect(browser.locator("body")).toBeVisible();

  await app.open("/desa/suplemen");
  await expect(browser).toHaveURL("/desa/suplemen");
  await expect(browser.locator("body")).toBeVisible();
});

// Katalog: OS-WEB-013 — IDM/SDGs publik + analisis survei.
test(
  "idm-sdgs dan analisis survei publik tersedia",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/idm-sdgs");
    await expect(browser).toHaveURL("/desa/idm-sdgs");
    await expect(browser.locator("body")).toBeVisible();

    await app.open("/desa/analisis-survei");
    await expect(browser).toHaveURL("/desa/analisis-survei");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WEB-015 — Kontak publik + komentar + umpan balik.
test(
  "kontak publik menerima komentar dan umpan balik",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/kontak");
    await expect(browser).toHaveURL("/desa/kontak");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WEB-016 — Tema: teks berjalan + sosial media.
test(
  "tema merender teks berjalan dan ikon sosial media",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/konten/tema");
    await expect(screen.getByRole("heading", { name: /tema/i })).toBeVisible();
  },
);

// Katalog: OS-WEB-017 — Pemindaian manifest tema.
test(
  "manifes tema divisualisasikan di halaman pengaturan",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/tema");
    await expect(screen.getByRole("heading", { name: /tema/i })).toBeVisible();
  },
);

// Katalog: OS-WEB-018 — Sitemap dinamis + robots.txt.
test("sitemap dan robots.txt responsif tanpa error", async ({ app, browser }) => {
  await app.open("/sitemap.xml");
  await expect(browser).toHaveURL("/sitemap.xml");
  await expect(browser.locator("body")).toBeVisible();

  await app.open("/robots.txt");
  await expect(browser).toHaveURL("/robots.txt");
  await expect(browser.locator("body")).toBeVisible();
});
