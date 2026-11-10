import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Generator gambar contoh untuk seeder Desa Kwala Gunung.
 *
 * Semua berkas ditulis sebagai SVG asli (bukan teks SVG yang disimpan dengan
 * ekstensi `.png`/`.jpg`), sehingga dapat disajikan langsung oleh route media
 * publik `/api/publik/media/<villageId>/<kategori>/<berkas>`.
 *
 * Gambar bersifat ilustratif: gradient, bentuk abstrak, dan teks judul. Tidak
 * ada aset pihak ketiga sehingga aman dari sisi lisensi.
 */

export type KategoriGambar = "slider" | "berita" | "galeri" | "perangkat" | "umum" | "dokumen";

export type TipeGambar = "banner" | "foto" | "potret" | "produk" | "logo";

export interface SpesifikasiGambar {
  kategori: KategoriGambar;
  /** Nama berkas tanpa ekstensi (huruf kecil, tanda hubung). */
  nama: string;
  judul: string;
  subjudul?: string;
  tipe?: TipeGambar;
  /** Dua warna gradient; bila kosong dipilih otomatis dari nama. */
  warna?: [string, string];
  lebar?: number;
  tinggi?: number;
}

const PALET: ReadonlyArray<readonly [string, string]> = [
  ["#0f766e", "#083344"],
  ["#1d4ed8", "#172554"],
  ["#b45309", "#451a03"],
  ["#7e22ce", "#3b0764"],
  ["#be123c", "#4c0519"],
  ["#15803d", "#052e16"],
  ["#0369a1", "#082f49"],
  ["#a16207", "#422006"],
];

/** Pilih pasangan warna deterministik dari nama berkas. */
function pilihWarna(nama: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < nama.length; i += 1) hash = (hash * 31 + nama.charCodeAt(i)) % 100000;
  return PALET[hash % PALET.length] ?? PALET[0]!;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Pecah teks menjadi baris maksimal `maks` karakter pada batas kata. */
function bungkusTeks(teks: string, maks: number, maksBaris = 3): string[] {
  const kata = teks.trim().split(/\s+/);
  const baris: string[] = [];
  let sekarang = "";

  for (const bagian of kata) {
    const calon = sekarang ? `${sekarang} ${bagian}` : bagian;
    if (calon.length > maks && sekarang) {
      baris.push(sekarang);
      sekarang = bagian;
      if (baris.length === maksBaris) break;
    } else {
      sekarang = calon;
    }
  }
  if (baris.length < maksBaris && sekarang) baris.push(sekarang);
  return baris;
}

function barisTeks(
  baris: readonly string[],
  opsi: { x: number; y: number; ukuran: number; warna: string; bobot?: number; jarak?: number },
): string {
  const jarak = opsi.jarak ?? opsi.ukuran * 1.22;
  return baris
    .map(
      (teks, index) =>
        `<text x="${opsi.x}" y="${opsi.y + index * jarak}" font-family="'Segoe UI',system-ui,sans-serif" font-size="${opsi.ukuran}" font-weight="${opsi.bobot ?? 400}" fill="${opsi.warna}">${escapeXml(teks)}</text>`,
    )
    .join("\n  ");
}

function defsGradient(id: string, warna: readonly [string, string]): string {
  return `<defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${warna[0]}"/>
      <stop offset="100%" stop-color="${warna[1]}"/>
    </linearGradient>
    <pattern id="${id}-dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="rgba(255,255,255,0.16)"/>
    </pattern>
  </defs>`;
}

function svgBanner(spec: SpesifikasiGambar, warna: readonly [string, string]): string {
  const w = spec.lebar ?? 1600;
  const h = spec.tinggi ?? 620;
  const judul = bungkusTeks(spec.judul, 26, 2);
  const sub = spec.subjudul ? bungkusTeks(spec.subjudul, 52, 2) : [];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(spec.judul)}">
  ${defsGradient("bg", warna)}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#bg-dots)"/>
  <circle cx="${w * 0.84}" cy="${h * 0.2}" r="${h * 0.46}" fill="rgba(255,255,255,0.07)"/>
  <circle cx="${w * 0.95}" cy="${h * 0.85}" r="${h * 0.34}" fill="rgba(255,255,255,0.05)"/>
  <path d="M0 ${h * 0.74} Q ${w * 0.26} ${h * 0.6} ${w * 0.52} ${h * 0.72} T ${w} ${h * 0.66} L ${w} ${h} L 0 ${h} Z" fill="rgba(255,255,255,0.10)"/>
  <path d="M0 ${h * 0.84} Q ${w * 0.3} ${h * 0.72} ${w * 0.6} ${h * 0.82} T ${w} ${h * 0.78} L ${w} ${h} L 0 ${h} Z" fill="rgba(0,0,0,0.14)"/>
  <rect x="80" y="70" width="330" height="40" rx="20" fill="rgba(255,255,255,0.16)"/>
  <text x="102" y="96" font-family="'Segoe UI',system-ui,sans-serif" font-size="15" font-weight="600" letter-spacing="2.4" fill="rgba(255,255,255,0.92)">PEMERINTAH DESA KWALA GUNUNG</text>
  ${barisTeks(judul, { x: 80, y: 210, ukuran: 58, warna: "#ffffff", bobot: 700, jarak: 68 })}
  ${sub.length ? barisTeks(sub, { x: 80, y: 210 + judul.length * 68 + 34, ukuran: 22, warna: "rgba(255,255,255,0.86)" }) : ""}
  <text x="${w - 80}" y="${h - 46}" text-anchor="end" font-family="'Segoe UI',system-ui,sans-serif" font-size="18" fill="rgba(255,255,255,0.78)">Datuk Lima Puluh · Batu Bara</text>
</svg>`;
}

function svgFoto(spec: SpesifikasiGambar, warna: readonly [string, string]): string {
  const w = spec.lebar ?? 1200;
  const h = spec.tinggi ?? 800;
  const judul = bungkusTeks(spec.judul, 30, 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(spec.judul)}">
  ${defsGradient("bg", warna)}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#bg-dots)"/>
  <circle cx="${w * 0.22}" cy="${h * 0.3}" r="${h * 0.3}" fill="rgba(255,255,255,0.08)"/>
  <circle cx="${w * 0.8}" cy="${h * 0.22}" r="${h * 0.16}" fill="rgba(255,255,255,0.10)"/>
  <path d="M0 ${h * 0.7} Q ${w * 0.25} ${h * 0.56} ${w * 0.5} ${h * 0.68} T ${w} ${h * 0.6} L ${w} ${h} L 0 ${h} Z" fill="rgba(0,0,0,0.18)"/>
  <path d="M0 ${h * 0.8} Q ${w * 0.32} ${h * 0.7} ${w * 0.62} ${h * 0.79} T ${w} ${h * 0.74} L ${w} ${h} L 0 ${h} Z" fill="rgba(0,0,0,0.26)"/>
  <rect x="0" y="${h - 150}" width="${w}" height="150" fill="rgba(0,0,0,0.35)"/>
  ${barisTeks(judul, { x: 56, y: h - 96, ukuran: 34, warna: "#ffffff", bobot: 700, jarak: 40 })}
  ${spec.subjudul ? `<text x="56" y="${h - 30}" font-family="'Segoe UI',system-ui,sans-serif" font-size="18" fill="rgba(255,255,255,0.8)">${escapeXml(spec.subjudul)}</text>` : ""}
</svg>`;
}

function inisial(nama: string): string {
  return nama
    .split(/\s+/)
    .filter((bagian) => /^[A-Za-zÀ-ÿ]/.test(bagian))
    .slice(0, 2)
    .map((bagian) => bagian.charAt(0).toUpperCase())
    .join("");
}

function svgPotret(spec: SpesifikasiGambar, warna: readonly [string, string]): string {
  const w = spec.lebar ?? 600;
  const h = spec.tinggi ?? 760;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Foto ${escapeXml(spec.judul)}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${warna[0]}"/>
      <stop offset="100%" stop-color="${warna[1]}"/>
    </linearGradient>
    <linearGradient id="foto" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w / 2}" cy="${h * 0.42}" r="${w * 0.38}" fill="rgba(255,255,255,0.10)"/>
  <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="rgba(0,0,0,0.22)"/>
  <g>
    <circle cx="${w / 2}" cy="${h * 0.34}" r="${w * 0.16}" fill="url(#foto)"/>
    <path d="M ${w / 2 - w * 0.26} ${h * 0.62} Q ${w / 2} ${h * 0.4} ${w / 2 + w * 0.26} ${h * 0.62} Z" fill="url(#foto)"/>
    <text x="${w / 2}" y="${h * 0.37}" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="${w * 0.12}" font-weight="700" fill="${warna[0]}">${escapeXml(inisial(spec.judul))}</text>
  </g>
  <text x="${w / 2}" y="${h - 92}" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="26" font-weight="700" fill="#ffffff">${escapeXml(spec.judul)}</text>
  <text x="${w / 2}" y="${h - 54}" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="16" fill="rgba(255,255,255,0.8)">${escapeXml(spec.subjudul ?? "Pemerintah Desa Kwala Gunung")}</text>
</svg>`;
}

function svgProduk(spec: SpesifikasiGambar, warna: readonly [string, string]): string {
  const w = spec.lebar ?? 900;
  const h = spec.tinggi ?? 900;
  const judul = bungkusTeks(spec.judul, 20, 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(spec.judul)}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${warna[0]}"/>
      <stop offset="100%" stop-color="${warna[1]}"/>
    </linearGradient>
    <linearGradient id="kartu" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.06)"/>
    </linearGradient>
    <pattern id="bg-dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="rgba(255,255,255,0.16)"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="#f8fafc"/>
  <rect width="${w}" height="${h * 0.62}" fill="url(#bg)"/>
  <rect width="${w}" height="${h * 0.62}" fill="url(#bg-dots)"/>
  <circle cx="${w * 0.2}" cy="${h * 0.16}" r="${w * 0.16}" fill="rgba(255,255,255,0.10)"/>
  <circle cx="${w * 0.86}" cy="${h * 0.46}" r="${w * 0.12}" fill="rgba(255,255,255,0.10)"/>
  <g transform="translate(${w * 0.5} ${h * 0.34})">
    <ellipse cx="0" cy="70" rx="170" ry="34" fill="rgba(0,0,0,0.18)"/>
    <rect x="-120" y="-30" width="240" height="110" rx="22" fill="url(#kartu)" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>
    <path d="M-120 -30 L0 -95 L120 -30" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="0" cy="25" r="26" fill="rgba(255,255,255,0.35)"/>
  </g>
  <rect x="40" y="${h * 0.66}" width="${w - 80}" height="${h * 0.3}" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  ${barisTeks(judul, { x: 80, y: h * 0.72, ukuran: 40, warna: "#0f172a", bobot: 700, jarak: 48 })}
  ${spec.subjudul ? `<text x="80" y="${h * 0.72 + judul.length * 48 + 14}" font-family="'Segoe UI',system-ui,sans-serif" font-size="26" font-weight="600" fill="${warna[0]}">${escapeXml(spec.subjudul)}</text>` : ""}
  <text x="${w - 80}" y="${h - 40}" text-anchor="end" font-family="'Segoe UI',system-ui,sans-serif" font-size="16" fill="#64748b">Lapak Desa Kwala Gunung</text>
</svg>`;
}

function svgLogo(spec: SpesifikasiGambar, warna: readonly [string, string]): string {
  const s = 512;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" role="img" aria-label="Logo ${escapeXml(spec.judul)}">
  ${defsGradient("bg", warna)}
  <circle cx="256" cy="256" r="248" fill="#ffffff"/>
  <circle cx="256" cy="256" r="236" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="196" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="6"/>
  <path d="M256 96 L286 178 L372 178 L304 230 L330 314 L256 264 L182 314 L208 230 L140 178 L226 178 Z" fill="rgba(255,255,255,0.95)"/>
  <text x="256" y="400" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="58" font-weight="800" letter-spacing="4" fill="#ffffff">KG</text>
  <text x="256" y="440" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="18" letter-spacing="3" fill="rgba(255,255,255,0.85)">KWALA GUNUNG</text>
</svg>`;
}

export function mediaRoot(villageId: number): string {
  return path.join(process.cwd(), "storage", "media", String(villageId));
}

/** Render SVG sesuai tipe gambar. */
export function renderSvg(spec: SpesifikasiGambar): string {
  const warna = spec.warna ?? pilihWarna(spec.nama);
  switch (spec.tipe ?? "foto") {
    case "banner":
      return svgBanner(spec, warna);
    case "potret":
      return svgPotret(spec, warna);
    case "produk":
      return svgProduk(spec, warna);
    case "logo":
      return svgLogo(spec, warna);
    case "foto":
    default:
      return svgFoto(spec, warna);
  }
}

/**
 * Tulis satu gambar SVG dan kembalikan jalur relatif media untuk basis data.
 *
 * Contoh hasil: `/1/slider/banner-1.svg`.
 */
export async function tulisGambar(villageId: number, spec: SpesifikasiGambar): Promise<string> {
  const direktori = path.join(mediaRoot(villageId), spec.kategori);
  await fs.promises.mkdir(direktori, { recursive: true });
  const namaBerkas = `${spec.nama}.svg`;
  await fs.promises.writeFile(path.join(direktori, namaBerkas), renderSvg(spec), "utf-8");
  return `/${villageId}/${spec.kategori}/${namaBerkas}`;
}

/** Apakah berkas gambar sudah ada di disk? */
export function gambarAda(villageId: number, relatif: string): boolean {
  return fs.existsSync(path.join(mediaRoot(villageId), relatif.replace(/^\/+/, "")));
}
