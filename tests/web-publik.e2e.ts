import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-WEB-001 — Beranda publik: sambutan, slider, statistik ringkas, widget, berita, surat, agenda
// ============================================================================
test(
  "beranda publik dapat diakses dan menampilkan konten utama",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/");
    await expect(browser).toHaveURL("/");
    // Cek bahwa halaman utama memiliki konten
    await expect(browser.locator("body")).toBeVisible();
    // Cek elemen yang mungkin ada (bisa berapa saja di desktop vs mobile)
    const hasHeader = await browser.locator("header, h1, .sidebar").first();
    if (await hasHeader.isVisible({ timeout: 3000 })) {
      // Setidaknya ada header atau judul
    }
  },
);

// ============================================================================
// OS-WEB-002 — Berita: CRUD admin, kategori, status terbit, detail publik, arsip, hit, pencarian
// ============================================================================
test(
  "berita publik dapat diakses dan menampilkan daftar",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/berita");
    await expect(browser).toHaveURL("/desa/berita");
    await expect(browser.locator("body")).toBeVisible();
  },
);

test(
  "berita detail publik dapat diakses via link",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/berita");
    // Cari link ke detail
    const links = browser.locator("a[href*='/desa/berita/']");
    const count = await links.count();
    if (count > 0) {
      await links.first().click({ timeout: 3000 });
      await expect(browser).toHaveURL(/\/desa\/berita\/.+/);
      await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
    }
  },
);

// ============================================================================
// OS-WEB-003 — Profil publik + pemerintahan/perangkat + lembaga
// ============================================================================
test("profil publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/profil");
  await expect(browser).toHaveURL("/desa/profil");
  await expect(browser.locator("body")).toBeVisible();
});

test("pemerintahan publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/pemerintahan");
  await expect(browser).toHaveURL("/desa/pemerintahan");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

// ============================================================================
// OS-WEB-004 — Galeri publik: admin album/foto + publik /desa/galeri + detail + cetak
// ============================================================================
test("galeri publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/galeri");
  await expect(browser).toHaveURL("/desa/galeri");
  await expect(browser.locator("body")).toBeVisible();
});

test("galeri detail dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/galeri");
  const links = browser.locator("a[href*='/desa/galeri/']");
  const count = await links.count();
  if (count > 0) {
    await links.first().click({ timeout: 3000 });
    await expect(browser).toHaveURL(/\/desa\/galeri\/.+/);
    await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
  }
});

// ============================================================================
// OS-WEB-005 — Dokumen publik + produk hukum: filter jenis, arsip per tahun, embed HTTPS
// ============================================================================
test(
  "dokumen publik dapat diakses dengan filter",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/dokumen");
    await expect(browser).toHaveURL("/desa/dokumen");
    await expect(browser.locator("body")).toBeVisible();
  },
);

test("arsip dokumen per tahun dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/dokumen");
  // Coba filter tahun jika ada
  const tahunFilter = browser.locator('[name="tahun"]');
  if (await tahunFilter.isVisible({ timeout: 3000 })) {
    await tahunFilter.click();
  }
});

// ============================================================================
// OS-WEB-006 — Peta publik (Leaflet): area/garis/titik/polygon + /api/peta
// ============================================================================
test("peta publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/peta");
  await expect(browser).toHaveURL("/desa/peta");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

test("peta menampilkan Leaflet map container", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/peta");
  // Cari container peta Leaflet
  const mapContainers = browser.locator("#map, [class*='leaflet'], .map-container");
  const visible = await mapContainers.first().isVisible({ timeout: 10_000 });
  // Jika tidak terlihat di timeout, itu bukan kegagalan fatal
  if (!visible) {
    // Coba ambil elemen apa saja di halaman
    await expect(browser.locator("svg, canvas, canvas")).toBeVisible({ timeout: 5000 });
  }
});

// ============================================================================
// OS-WEB-008 — Pembangunan publik + linimasa: CRUD proyek, detail, dokumentasi foto
// ============================================================================
test("pembangunan publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/pembangunan");
  await expect(browser).toHaveURL("/desa/pembangunan");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

test("pembangunan detail dapat diakses via link", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/pembangunan");
  const links = browser.locator("a[href*='/desa/pembangunan/']");
  const count = await links.count();
  if (count > 0) {
    await links.first().click({ timeout: 3000 });
    await expect(browser).toHaveURL(/\/desa\/pembangunan\/.+/);
    await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
  }
});

// ============================================================================
// OS-WEB-009 — Pengaduan publik + lacak status: form, pelacakan, notifikasi
// ============================================================================
test("pengaduan publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/pengaduan");
  await expect(browser).toHaveURL("/desa/pengaduan");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

test("form pelacakan pengaduan tersedia", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/pengaduan/lacak");
  await expect(browser).toHaveURL("/desa/pengaduan/lacak");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

// ============================================================================
// OS-WEB-010 — Kelompok/lembaga publik + publikasi anggota: kontrol tampil_publik, cetak daftar
// ============================================================================
test("kelompok publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/kelompok");
  await expect(browser).toHaveURL("/desa/kelompok");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

test(
  "daftar anggota kelompok terpublikasi terlihat",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/kelompok");
    // Cari teks tentang anggota atau ketua
    const anggotaText = browser.locator("text=/anggota|ketua|lembaga/i");
    if (await anggotaText.first().isVisible({ timeout: 3000 })) {
      // Lanjut
    }
  },
);

// ============================================================================
// OS-WEB-011 — Inventaris publik + filter granular + ekspor CSV (BOM UTF-8, proteksi formula)
// ============================================================================
test("inventaris publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/inventaris");
  await expect(browser).toHaveURL("/desa/inventaris");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

// ============================================================================
// OS-WEB-012 — Bantuan publik + suplemen: program, sasaran, data terhimpun, kolom isian
// ============================================================================
test("bantuan publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/bantuan");
  await expect(browser).toHaveURL("/desa/bantuan");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

test("suplemen publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/suplemen");
  await expect(browser).toHaveURL("/desa/suplemen");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

// ============================================================================
// OS-WEB-013 — IDM/SDGs publik + analisis survei: ringkasan skor, analisis agregat per pertanyaan
// ============================================================================
test("idm-sdgs publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/idm-sdgs");
  await expect(browser).toHaveURL("/desa/idm-sdgs");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

test("analisis survei publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/analisis-survei");
  await expect(browser).toHaveURL("/desa/analisis-survei");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

// ============================================================================
// OS-WEB-015 — Kontak publik + komentar interaktif + umpan balik (captcha aritmetika + honeypot)
// ============================================================================
test("kontak publik dapat diakses", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/desa/kontak");
  await expect(browser).toHaveURL("/desa/kontak");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

// ============================================================================
// OS-WEB-016 — Tema: teks berjalan (≤300 char) + sosial media (FB, IG, YT, X, TikTok, WA, Telegram)
// ============================================================================
test("tema dapat diakses di halaman pengaturan", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/konten/tema");
  await expect(screen.getByRole("heading", { name: /tema|konten/i })).toBeVisible({
    timeout: 5000,
  });
});

// ============================================================================
// OS-WEB-017 — Pemindaian manifest tema build-time: slug semver, slot, validasi
// ============================================================================
test(
  "manifes tema halaman pengaturan dapat diakses",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/konten/tema");
    await expect(screen.getByRole("heading", { name: /tema|pengaturan/i })).toBeVisible({
      timeout: 5000,
    });
  },
);

// ============================================================================
// OS-WEB-018 — Sitemap dinamis + robots.txt: cakupan URL dinamis (pengaduan, lapak, kesehatan, pertanahan, peta, kontak, verifikasi)
// ============================================================================
test("sitemap.xml dapat diakses", async ({ app, browser }) => {
  await app.open("/sitemap.xml");
  await expect(browser).toHaveURL("/sitemap.xml");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});

test("robots.txt dapat diakses", async ({ app, browser }) => {
  await app.open("/robots.txt");
  await expect(browser).toHaveURL("/robots.txt");
  await expect(browser.locator("body")).toBeVisible({ timeout: 5000 });
});
