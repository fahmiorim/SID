/**
 * Smoke test HTTP situs publik — bukti yang bisa dijalankan ulang untuk
 * klaim Fase 1G (semua halaman publik 200, tiga kasus 404, dan tidak ada
 * tautan internal yang mati).
 *
 * Skrip ini TIDAK menyalakan server sendiri. Jalankan build produksi lebih
 * dulu di terminal lain:
 *
 *   npm run build && npm run start      # terminal 1
 *   npm run smoke                       # terminal 2
 *
 * Variabel opsional:
 *   SMOKE_BASE_URL   default http://localhost:3000
 *   SMOKE_VERBOSE=1  cetak status setiap URL yang diperiksa
 *
 * Keluar dengan status 1 bila ada kegagalan, sehingga bisa dipakai di CI
 * setelah langkah `npm run start`.
 */

const baseUrl = new URL(process.env.SMOKE_BASE_URL ?? "http://localhost:3000");
const verbose = process.env.SMOKE_VERBOSE === "1";

/** Halaman publik yang wajib terbuka tanpa sesi. */
const HALAMAN_WAJIB_200 = [
  "/",
  "/desa/profil",
  "/desa/pemerintahan",
  "/desa/berita",
  "/desa/galeri",
  "/desa/dokumen",
  "/desa/statistik",
  "/desa/apbdes",
  "/desa/kelompok",
  "/desa/inventaris",
  "/desa/status-des",
  "/desa/surat",
  "/desa/analisis-survei",
  "/desa/idm-sdgs",
  "/desa/bantuan",
  "/desa/kontak",
  "/desa/pertanahan",
  "/desa/pengaduan",
  "/desa/pengaduan/lacak",
  "/desa/verifikasi-surat",
  "/desa/pembangunan",
  "/desa/peta",
  "/layanan-mandiri",
  "/masuk",
] as const;

/** URL yang memang tidak ada — harus 404, bukan 200 atau 500. */
const HARUS_404 = ["/desa/tidak-ada", "/desa/halaman/tidak-ada", "/desa/berita/tidak-ada"] as const;

const EKSTENSI_ASET = /\.(png|jpe?g|gif|webp|svg|ico|css|js|map|xml|txt|webmanifest|pdf|woff2?)$/i;
const MAKS_URL = 200;
const TIMEOUT_MS = 20_000;

interface Hasil {
  path: string;
  status: number;
  finalUrl: string;
  html: string | null;
}

async function ambil(path: string): Promise<Hasil> {
  const res = await fetch(new URL(path, baseUrl), {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "sid-smoke/1.0" },
  });
  const tipe = res.headers.get("content-type") ?? "";
  return {
    path,
    status: res.status,
    finalUrl: res.url,
    html: tipe.includes("text/html") ? await res.text() : null,
  };
}

/** Ambil tautan internal yang layak diperiksa (tanpa aset, API, dan eksternal). */
function tautanInternal(html: string, dasar: string): string[] {
  const hasil: string[] = [];

  for (const cocok of html.matchAll(/href="([^"]+)"/g)) {
    const href = cocok[1];
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) {
      continue;
    }

    let url: URL;
    try {
      url = new URL(href, dasar);
    } catch {
      continue;
    }

    if (url.origin !== baseUrl.origin) continue;
    if (url.pathname.startsWith("/_next") || url.pathname.startsWith("/api")) continue;
    if (EKSTENSI_ASET.test(url.pathname)) continue;

    hasil.push(`${url.pathname}${url.search}`);
  }

  return hasil;
}

// Preflight: beri pesan jelas bila server belum dinyalakan.
try {
  await ambil("/masuk");
} catch {
  console.error(
    `Tidak dapat menghubungi ${baseUrl.origin}. Jalankan "npm run build && npm run start" lebih dulu.`,
  );
  process.exit(1);
}

const diperiksa = new Map<string, Hasil>();
const antre: string[] = [...HALAMAN_WAJIB_200];

// Telusuri halaman publik dan detail yang tertaut (berita, galeri, halaman).
while (antre.length > 0 && diperiksa.size < MAKS_URL) {
  const path = antre.shift();
  if (!path || diperiksa.has(path)) continue;

  const res = await ambil(path);
  diperiksa.set(path, res);
  if (verbose) console.log(`${String(res.status).padEnd(4)} ${path}`);

  if (!res.html) continue;

  for (const tautan of tautanInternal(res.html, res.finalUrl)) {
    if (!diperiksa.has(tautan) && !antre.includes(tautan)) antre.push(tautan);
  }
}

const kegagalan: string[] = [];

for (const path of HALAMAN_WAJIB_200) {
  const res = diperiksa.get(path);
  if (!res) {
    kegagalan.push(`${path} — tidak diperiksa`);
  } else if (res.status !== 200) {
    kegagalan.push(`${path} — diharapkan 200, dapat ${res.status}`);
  }
}

for (const path of HARUS_404) {
  const res = await ambil(path);
  diperiksa.set(path, res);
  if (verbose) console.log(`${String(res.status).padEnd(4)} ${path} (harus 404)`);
  if (res.status !== 404) {
    kegagalan.push(`${path} — diharapkan 404, dapat ${res.status}`);
  }
}

const himpunanHarus404 = new Set<string>(HARUS_404);
for (const [path, res] of diperiksa) {
  // Kasus 404 yang memang diharapkan sudah diperiksa di atas.
  if (himpunanHarus404.has(path)) continue;
  if (res.status === 404 || res.status >= 500) {
    kegagalan.push(`${path} — tautan internal mati (${res.status})`);
  }
}

// Hindari duplikat bila kasus 404 juga ditemukan lewat penelusuran.
const unik = [...new Set(kegagalan)];

const jumlahHalaman = HALAMAN_WAJIB_200.length;
const jumlah404 = HARUS_404.length;
const jumlahTautan = diperiksa.size;

console.log("");
console.log(`Base URL          : ${baseUrl.origin}`);
console.log(`Halaman wajib 200 : ${jumlahHalaman}`);
console.log(`Kasus wajib 404   : ${jumlah404}`);
console.log(`URL diperiksa     : ${jumlahTautan} (termasuk tautan internal)`);

if (unik.length > 0) {
  console.log(`\nGAGAL (${unik.length}):`);
  for (const baris of unik) console.log(`  - ${baris}`);
  process.exitCode = 1;
} else {
  console.log("\nLULUS: semua halaman publik 200, kasus 404 sesuai, tidak ada tautan mati.");
}
