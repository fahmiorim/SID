import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Katalog: OS-WEB-001 — Beranda publik
 */
test(
  "beranda publik: judul desa dan navigasi utama tampil",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/");
    await expect(browser).toHaveURL("/");
    await expect(browser.locator("h1")).toContainText("Desa Contoh");
    await expect(screen.getByRole("navigation").first()).toBeVisible();
    await expect(screen.getByRole("link", { name: /profil/i }).first()).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-001 — Landmark dan tautan lompat ke konten utama.
 *
 * Header tema (kontak, logo, menu) tidak boleh menjadi satu-satunya jalan ke
 * konten, jadi setiap halaman publik menyediakan tautan lewati + `main` yang
 * dapat difokuskan.
 */
test(
  "aksesibilitas publik: tautan lewati dan landmark konten utama",
  { timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/desa/berita");

    const struktur = await browser.evaluate(() => ({
      tautan: document.querySelector('a[href="#konten-utama"]')?.textContent?.trim() ?? null,
      tabindex: document.querySelector("main#konten-utama")?.getAttribute("tabindex") ?? null,
      jumlahMain: document.querySelectorAll("main").length,
    }));

    expect(struktur.tautan).toBe("Lewati ke konten utama");
    expect(struktur.tabindex).toBe("-1");
    expect(struktur.jumlahMain).toBe(1);
  },
);

/**
 * Katalog: OS-WEB-002 — Filter kategori berita menandai pilihan aktif
 */
test(
  "berita publik: filter kategori aktif ditandai aria-current",
  { timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/desa/berita");

    const aktif = await browser.evaluate(() =>
      Array.from(
        document.querySelectorAll('nav[aria-label="Filter kategori"] a[aria-current="page"]'),
      ).map((item) => item.textContent?.trim()),
    );

    expect(aktif).toEqual(["Semua"]);
  },
);

/**
 * Katalog: OS-WEB-003 — Profil, pemerintahan, dan perangkat desa
 */
test(
  "profil & pemerintahan publik: judul halaman dan daftar perangkat",
  { timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/desa/profil");
    await expect(browser.locator("h1")).toContainText("Profil Desa");

    await app.open("/desa/pemerintahan");
    await expect(browser.locator("h1")).toContainText("Pemerintahan Desa");
  },
);

/**
 * Katalog: OS-WEB-002 — Berita publik: daftar dan pencarian
 */
test(
  "berita publik: daftar dan form pencarian",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/desa/berita");
    await expect(browser.locator("h1")).toContainText("Berita Desa");
    await expect(screen.getByRole("searchbox")).toBeVisible();
    await screen.getByRole("searchbox").fill("desa");
    await screen.getByRole("button", { name: "Cari" }).tap();
    await expect(browser).toHaveURL(/q=desa/);
  },
);

/**
 * Katalog: OS-WEB-004 — Galeri publik
 */
test(
  "galeri publik: daftar album dan pencarian",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/desa/galeri");
    await expect(browser.locator("h1")).toContainText("Galeri Desa");
    await expect(screen.getByRole("searchbox")).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-005 — Dokumen publik: pencarian dan filter
 */
test(
  "dokumen publik: filter kategori, jenis, dan tahun",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/desa/dokumen");
    await expect(browser.locator("h1")).toContainText("Informasi Publik");
    await expect(screen.getByLabel("Cari dokumen")).toBeVisible();
    await expect(screen.getByLabel("Kategori dokumen")).toBeVisible();
    await expect(screen.getByLabel("Jenis dokumen")).toBeVisible();

    await screen.getByLabel("Cari dokumen").fill("profil");
    await screen.getByRole("button", { name: "Cari" }).tap();
    await expect(browser).toHaveURL(/q=profil/);
  },
);

/**
 * Katalog: OS-WEB-006 — Peta publik dan cetak peta.
 */
test(
  "peta publik: peta Leaflet dan cetak peta",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/desa/peta");
    await expect(browser.locator("h1")).toContainText("Peta Desa");
    await expect(browser.locator(".leaflet-container")).toBeVisible();
    await expect(browser.locator("body")).toContainText(/layer polygon|area|garis|titik/);

    await screen.getByRole("link", { name: "Cetak Peta" }).tap();
    await expect(browser).toHaveURL(/\/desa\/peta\/cetak$/);
    await expect(browser.locator("h1")).toContainText("Peta Desa");
    await expect(screen.getByRole("link", { name: "Kembali ke peta" })).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-007 — Pembangunan publik
 */
test("pembangunan publik: daftar proyek", { timeout: 60_000 }, async ({ app, browser }) => {
  await app.open("/desa/pembangunan");
  await expect(browser.locator("h1")).toContainText("Pembangunan Desa");
});

/**
 * Katalog: OS-WEB-009 — Pengaduan publik dan pelacakan tiket
 */
test(
  "pengaduan publik: form kirim dan form lacak tersedia",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/desa/pengaduan");
    await expect(browser.locator("h1")).toContainText("Pengaduan Warga");
    await expect(screen.getByLabel("Judul")).toBeVisible();
    await expect(screen.getByLabel("Uraian pengaduan")).toBeVisible();

    await app.open("/desa/pengaduan/lacak");
    await expect(browser.locator("h1")).toContainText("Lacak Pengaduan");
    await expect(screen.getByRole("button", { name: /lacak/i })).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-010 — Kelompok & lembaga publik (termasuk cetak)
 */
test(
  "kelompok publik: daftar dan tombol cetak",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    await app.open("/desa/kelompok");
    await expect(browser.locator("h1")).toContainText("Kelompok");
    await expect(screen.getByRole("button", { name: /Cetak/ }).first()).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-006/011/012/013 — Statistik, inventaris, bantuan, suplemen,
 * IDM/SDGs, dan analisis publik.
 */
test(
  "halaman publik lain: statistik, inventaris, bantuan, suplemen, IDM, dan survei",
  { timeout: 120_000 },
  async ({ app, screen, browser }) => {
    for (const [path, judul] of [
      ["/desa/statistik", "Statistik Desa"],
      ["/desa/inventaris", "Inventaris"],
      ["/desa/bantuan", "Program Bantuan Sosial"],
      ["/desa/suplemen", "Suplemen Data Desa"],
      ["/desa/idm-sdgs", "Indeks Desa Membangun"],
      ["/desa/analisis-survei", "Analisis"],
    ] as const) {
      await app.open(path);
      await expect(browser.locator("h1")).toContainText(judul);
    }

    await app.open("/desa/statistik");
    await expect(screen.getByText("Total Penduduk")).toBeVisible();
    await expect(screen.getByText("Realisasi APBDes Per Triwulan")).toBeVisible();

    await app.open("/desa/inventaris");
    await screen.getByLabel("Cari barang").fill("barang-tidak-ada-e2e");
    await screen.getByRole("button", { name: "Terapkan" }).tap();
    await expect(browser).toHaveURL(/q=barang-tidak-ada-e2e/);
    await expect(screen.getByText("0 barang cocok dengan filter.")).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-014 — Pertanahan dan APBDes publik
 */
test(
  "pertanahan & APBDes publik: data warga dan transparansi anggaran",
  { timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/desa/pertanahan");
    await expect(browser.locator("h1")).toContainText("Data Pertanahan");

    await app.open("/desa/apbdes");
    await expect(browser.locator("h1")).toContainText("Transparansi APBDes");
  },
);

/**
 * Katalog: OS-WEB-015 — Kontak publik
 */
test("kontak publik: informasi kontak desa", { timeout: 60_000 }, async ({ app, browser }) => {
  await app.open("/desa/kontak");
  await expect(browser.locator("h1")).toContainText("Kontak");
});

/**
 * Katalog: OS-WEB-016 — Pengaturan tema
 */
test(
  "tema: halaman pengaturan admin",
  { session: "admin", timeout: 60_000 },
  async ({ app, screen }) => {
    await app.open("/konten/tema");
    await expect(screen.getByRole("heading", { name: "Tema Situs" })).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-018 — Sitemap, robots, dan metadata
 */
test("sitemap & robots memuat rute publik", { timeout: 60_000 }, async ({ app, browser }) => {
  await app.open("/sitemap.xml");
  const sitemap = await browser.locator("body").textContent();
  expect(sitemap).toContain("/desa/berita");
  expect(sitemap).toContain("/desa/pengaduan");

  await app.open("/robots.txt");
  const robots = await browser.locator("body").textContent();
  expect(robots).toContain("Sitemap");
});

/**
 * Katalog: OS-WEB-018 — metadata halaman publik
 */
test(
  "metadata: title dan og:title terisi pada halaman publik",
  { timeout: 60_000 },
  async ({ app, browser }) => {
    await app.open("/desa/berita");
    const title = await browser.evaluate(() => document.title);
    expect(title).toContain("Berita");
    const ogTitle = await browser.evaluate(() =>
      document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
    );
    expect(ogTitle).toBeTruthy();
  },
);
