import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  buatInventarisDesaLainUji,
  buatInventarisPublikUji,
  buatLapakPublikUji,
  buatProfilDanPerangkatPublikUji,
  buatSuplemenPublikUji,
  buatSurveiAnalisisPublikUji,
  buatSurveiDesaLainUji,
  hapusInventarisUji,
  hapusLapakPublikUji,
  hapusProfilDanPerangkatUji,
  hapusSuplemenPublikUji,
  hapusSurveiDesaLainUji,
  hapusSurveyDariJudul,
} from "./support/database";

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
 * Katalog: OS-WEB-003 — Profil dan pemerintahan publik: visi/misi dari data
 * desa, perangkat aktif beserta jabatannya, dan bagan SOTK.
 */
test(
  "profil & pemerintahan publik: visi/misi, perangkat aktif, dan bagan SOTK",
  { timeout: 90_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const visi = `Visi E2E ${cap}`;
    const misi = [`Misi pertama E2E ${cap}`, `Misi kedua E2E ${cap}`];
    const namaKepala = `Kepala E2E ${cap}`;
    const namaSekretaris = `Sekretaris E2E ${cap}`;
    const namaStaf = `Staf E2E ${cap}`;
    const fixture = await buatProfilDanPerangkatPublikUji({
      visi,
      misi,
      perangkat: [
        { nama: namaKepala, jabatan: "kepala" },
        { nama: namaSekretaris, jabatan: "sekretaris" },
        { nama: namaStaf, jabatan: "staf" },
      ],
    });

    try {
      await app.open("/desa/profil");
      await expect(browser.locator("h1")).toContainText("Profil Desa");
      await expect(screen.getByRole("heading", { name: "Identitas Wilayah" })).toBeVisible();
      await expect(screen.getByRole("heading", { name: "Visi" })).toBeVisible();
      await expect(screen.getByText(visi)).toBeVisible();
      await expect(screen.getByRole("heading", { name: "Misi" })).toBeVisible();
      for (const butir of misi) {
        await expect(screen.getByText(butir)).toBeVisible();
      }

      await app.open("/desa/pemerintahan");
      await expect(browser.locator("h1")).toContainText("Pemerintahan Desa");
      await expect(screen.getByText("Bagan SOTK")).toBeVisible();
      await expect(screen.getByRole("heading", { name: "Perangkat Desa" })).toBeVisible();
      await expect(screen.getByText(namaKepala).first()).toBeVisible();
      await expect(screen.getByText(namaSekretaris).first()).toBeVisible();
      await expect(screen.getByText(namaStaf).first()).toBeVisible();
      await expect(screen.getByText("Staf Pemerintahan", { exact: true }).first()).toBeVisible();
    } finally {
      await hapusProfilDanPerangkatUji(fixture);
    }
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
 * Katalog: OS-WEB-012 — Suplemen publik: ringkasan agregat, detail kolom, dan
 * slug asing ditolak. Nilai isian warga tidak boleh ikut tampil.
 */
test(
  "suplemen publik: ringkasan dan detail hanya menampilkan agregat",
  { timeout: 60_000 },
  async ({ app, screen, browser }) => {
    const nama = `Suplemen Publik E2E ${Date.now()}`;
    const fixture = await buatSuplemenPublikUji({
      nama,
      keterangan: "Pendataan uji halaman publik",
      isian: { "Nomor Kartu": "A-1" },
    });

    try {
      await app.open("/desa/suplemen");
      await expect(screen.getByRole("heading", { name: nama, exact: true })).toBeVisible();
      await expect(screen.getByText(/Sasaran: Keluarga \(KK\) · 1 data/).first()).toBeVisible();

      await app.open(`/desa/suplemen/${fixture.slug}`);
      await expect(browser.locator("h1")).toContainText(nama);
      await expect(
        screen.getByText("Sasaran: Keluarga (KK) · 1 data terhimpun", { exact: true }),
      ).toBeVisible();
      await expect(screen.getByRole("heading", { name: "Kolom data" })).toBeVisible();
      await expect(screen.getByText("Nomor Kartu", { exact: true })).toBeVisible();
      // Nama kolom dipublikasikan, nilainya tidak.
      await expect(screen.getByText(/A-1/)).toHaveCount(0);
    } finally {
      await hapusSuplemenPublikUji(fixture.id);
    }

    // Suplemen yang sudah tidak ada tidak dapat dibuka lewat slug lamanya.
    await app.open(`/desa/suplemen/${fixture.slug}`);
    await expect(screen.getByText("Halaman tidak ditemukan", { exact: true })).toBeVisible();
  },
);

/**
 * Katalog: OS-WEB-011 — Inventaris publik: filter lewat formulir dan ekspor
 * CSV yang mengikuti filter. Barang desa lain tidak boleh ikut tampil.
 */
test(
  "inventaris publik: filter, hitungan hasil, dan ekspor CSV",
  { timeout: 90_000 },
  async ({ app, screen, browser }) => {
    const nama = `Genset E2E ${Date.now()}`;
    const kategori = `Peralatan E2E ${Date.now()}`;
    const namaDesaLain = `Barang Desa Lain ${Date.now()}`;
    const milik = await buatInventarisPublikUji({ nama, kategori, tahun: 2024 });
    const desaLain = await buatInventarisDesaLainUji({ nama: namaDesaLain, kategori });

    try {
      await app.open("/desa/inventaris");
      await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();
      // Barang desa lain tidak pernah muncul di daftar publik.
      await expect(screen.getByText(namaDesaLain)).toHaveCount(0);

      await screen.getByLabel("Cari barang").fill(nama);
      await screen.getByRole("button", { name: "Terapkan" }).tap();
      await expect(browser).toHaveURL(/q=Genset/);
      await expect(screen.getByText("1 barang cocok dengan filter.")).toBeVisible();
      await expect(screen.getByRole("cell", { name: nama, exact: true })).toBeVisible();

      // Unduhan CSV memakai filter yang sama dengan halaman.
      const csv = await browser.evaluate(async (kata: string) => {
        const respons = await fetch(`/desa/inventaris/ekspor?q=${encodeURIComponent(kata)}`);
        return {
          status: respons.status,
          tipe: respons.headers.get("content-type") ?? "",
          disposisi: respons.headers.get("content-disposition") ?? "",
          body: await respons.text(),
        };
      }, nama);
      expect(csv.status).toBe(200);
      expect(csv.tipe).toContain("text/csv");
      expect(csv.disposisi).toContain("inventaris-");
      expect(csv.body).toContain("Nama Barang");
      expect(csv.body).toContain(nama);
      expect(csv.body).not.toContain(namaDesaLain);
    } finally {
      await hapusInventarisUji(milik);
      await hapusInventarisUji(desaLain);
    }
  },
);

/**
 * Katalog: OS-WEB-013 — Analisis publik: rekap agregat per pertanyaan, filter
 * periode, dan isolasi tenant. Nama/NIK responden serta isi jawaban teks tidak
 * boleh ikut tampil.
 */
test(
  "analisis publik: rekap agregat dan filter periode tanpa data pribadi",
  { timeout: 120_000 },
  async ({ app, screen, browser }) => {
    const judul = `Survei Analisis Publik E2E ${Date.now()}`;
    const judulDesaLain = `Survei Desa Lain E2E ${Date.now()}`;
    const namaResponden = `Responden Rahasia E2E ${Date.now()}`;
    const nikResponden = "3201010101019999";
    const tahun = new Date().getFullYear();

    await buatSurveiAnalisisPublikUji({
      judul,
      soal: [
        {
          pertanyaan: "Bagaimana kepuasan pelayanan desa?",
          tipe: "choice",
          pilihan: ["Puas", "Tidak puas"],
        },
        { pertanyaan: "Berapa anggota keluarga Anda?", tipe: "number" },
        { pertanyaan: "Apa saran Anda untuk desa?", tipe: "text" },
      ],
      responden: [
        { nama: namaResponden, nik: nikResponden, jawaban: ["Puas", "4", "Isi rahasia E2E"] },
        {
          nama: `${namaResponden} 2`,
          nik: "3201010101019998",
          jawaban: ["Puas", "6", "Isi rahasia lain"],
        },
      ],
    });
    const desaLain = await buatSurveiDesaLainUji(judulDesaLain);

    try {
      await app.open("/desa/analisis-survei");
      await expect(browser.locator("h1")).toContainText("Analisis & Survei");
      await expect(screen.getByRole("heading", { name: judul, exact: true })).toBeVisible();
      await expect(screen.getByText("3 pertanyaan", { exact: true })).toBeVisible();
      await expect(screen.getByText("2 responden", { exact: true })).toBeVisible();
      await expect(screen.getByRole("heading", { name: "Hasil pendataan" })).toBeVisible();
      await expect(screen.getByText(/2 responden · seluruh periode/)).toBeVisible();

      // Distribusi pilihan, rata-rata angka, dan jumlah jawaban teks.
      await expect(screen.getByText("2 (100%)", { exact: true })).toBeVisible();
      await expect(screen.getByText(/Rata-rata 5 dari 2 jawaban/)).toBeVisible();
      await expect(screen.getByText(/2 jawaban \(isi tidak dipublikasikan\)/)).toBeVisible();

      // Identitas responden dan isi jawaban teks tidak pernah tampil.
      await expect(screen.getByText(new RegExp(namaResponden))).toHaveCount(0);
      await expect(screen.getByText(new RegExp(nikResponden))).toHaveCount(0);
      await expect(screen.getByText(/Isi rahasia/)).toHaveCount(0);

      // Survei desa lain tidak ikut tampil di daftar publik.
      await expect(screen.getByText(new RegExp(judulDesaLain))).toHaveCount(0);

      // Filter periode tahun berjalan menyaring rekap.
      await screen.getByLabel("Periode hasil").selectOption({ label: String(tahun) });
      await screen.getByRole("button", { name: "Tampilkan" }).tap();
      await expect(browser).toHaveURL(new RegExp(`tahun=${tahun}`));
      await expect(screen.getByText(new RegExp(`2 responden · tahun ${tahun}`))).toBeVisible();
      await expect(screen.getByRole("link", { name: "Hapus filter" })).toBeVisible();

      // Halaman pengisian survei desa lain tetap 404.
      await app.open(`/desa/analisis-survei/${desaLain.id}/isi`);
      await expect(screen.getByText("Halaman tidak ditemukan", { exact: true })).toBeVisible();
    } finally {
      await hapusSurveyDariJudul(judul);
      await hapusSurveiDesaLainUji(desaLain.id, desaLain.villageId);
    }
  },
);

/**
 * Katalog: OS-WEB-014 — Lapak publik: katalog hasil pencarian, halaman produk,
 * dan peta produk berkoordinat.
 */
test(
  "lapak publik: katalog, produk, dan peta produk",
  { timeout: 90_000 },
  async ({ app, screen, browser }) => {
    const cap = Date.now();
    const namaLapak = `Lapak Publik E2E ${cap}`;
    const namaProduk = `Produk Peta E2E ${cap}`;
    const kategori = `Kategori E2E ${cap}`;
    const fixture = await buatLapakPublikUji({
      nama: namaLapak,
      kategori,
      produk: [
        {
          nama: namaProduk,
          harga: "12500.00",
          stok: 3,
          latitude: "-6.200000",
          longitude: "106.800000",
        },
      ],
    });

    try {
      await app.open(`/desa/lapak?q=${encodeURIComponent(namaLapak)}`);
      await expect(browser.locator("h1")).toContainText("Lapak Desa");
      await expect(screen.getByText(/1 lapak ditemukan/)).toBeVisible();
      await expect(screen.getByRole("heading", { name: namaLapak })).toBeVisible();
      await expect(screen.getByText(/1 produk tersedia/)).toBeVisible();

      await screen.getByRole("link", { name: "Lihat Produk" }).tap();
      await expect(browser).toHaveURL(new RegExp(`/desa/lapak/${fixture.id}/produk$`));
      await expect(screen.getByText(namaProduk, { exact: true })).toBeVisible();
      await expect(screen.getByText("Rp 12.500").first()).toBeVisible();

      await app.open("/desa/lapak/peta");
      await expect(browser.locator("h1")).toContainText("Peta Produk UMKM");
      await expect(browser.locator(".leaflet-container")).toBeVisible();
      await expect(screen.getByText(namaProduk, { exact: true })).toBeVisible();
      await expect(screen.getByText(`Lapak: ${namaLapak}`)).toBeVisible();
      await expect(screen.getByText("Rp 12.500").first()).toBeVisible();
      await expect(screen.getByText(/6\.200000, 106\.800000/)).toBeVisible();
    } finally {
      await hapusLapakPublikUji(fixture);
    }
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
