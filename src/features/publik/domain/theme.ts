import { z } from "zod";

/**
 * Kontrak tema situs publik (Fase 1D.2).
 *
 * Sebuah tema adalah paket **kode yang dikompilasi saat build** di
 * `src/themes/<slug>/`. Kontrak di bawah menjelaskan bentuk manifest, daftar
 * slot halaman yang harus dapat dirender, serta opsi yang boleh diatur operator
 * per desa. Semua tipe murni (tanpa I/O) sehingga aman dipakai di klien
 * (form admin) maupun server (resolusi tema).
 */

/** Slot halaman yang dapat dipasok sebuah tema. */
export const THEME_SLOTS = [
  "layout",
  "home",
  "profil",
  "perangkat",
  "berita",
  "berita-detail",
  "galeri",
  "galeri-detail",
  "dokumen",
  "statistik",
  "apbdes",
  "bantuan",
  "kontak",
  "layanan-mandiri",
  "halaman",
] as const;

export type ThemeSlot = (typeof THEME_SLOTS)[number];

/** Label manusiawi untuk setiap slot (dipakai di halaman admin tema). */
export const THEME_SLOT_LABELS: Record<ThemeSlot, string> = {
  layout: "Kerangka (header & footer)",
  home: "Beranda",
  profil: "Profil Desa",
  perangkat: "Pemerintahan / Perangkat",
  berita: "Daftar Berita",
  "berita-detail": "Detail Berita",
  galeri: "Daftar Galeri",
  "galeri-detail": "Detail Album Galeri",
  dokumen: "Informasi Publik / Dokumen",
  statistik: "Statistik Desa",
  apbdes: "Transparansi APBDes",
  bantuan: "Program Bantuan",
  kontak: "Kontak",
  "layanan-mandiri": "Layanan Mandiri",
  halaman: "Halaman Statis",
};

/** Susunan bagian yang dapat diatur pada beranda. */
export const HOME_SECTION_IDS = [
  "hero",
  "slider",
  "statistik",
  "berita",
  "surat",
  "kontak",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: "Sambutan / hero",
  slider: "Sorotan desa",
  statistik: "Data kependudukan",
  berita: "Berita terbaru",
  surat: "Surat layanan terbaru",
  kontak: "Kontak desa",
};

/** Pilihan font yang disediakan tema (dipetakan ke CSS variable). */
export const FONT_CHOICES = ["system", "serif", "sans"] as const;
export type FontChoice = (typeof FONT_CHOICES)[number];

export const FONT_LABELS: Record<FontChoice, string> = {
  system: "Bawaan sistem",
  sans: "Sans-serif modern",
  serif: "Serif klasik",
};

/** Pola header: logo+nama, atau dengan latar berwarna. */
export const HEADER_VARIANTS = ["terang", "berwarna"] as const;

/** Maksimal jumlah bagian beranda yang boleh diatur sekaligus. */
const DEFAULT_HOME_SECTIONS: HomeSectionId[] = ["hero", "statistik", "berita", "kontak"];

/**
 * Opsi tema yang boleh diatur operator. Divalidasi sebelum disimpan dan saat
 * dibaca (data lama/manual di database tidak dipercaya begitu saja).
 */
export const themeOptionsSchema = z.object({
  warnaPrimer: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format heks seperti #1a7f4b.")
    .default("#1a7f4b"),
  warnaSekunder: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format heks seperti #0f5132.")
    .default("#0f5132"),
  /** Preset font; nilainya dipetakan ke CSS variable oleh tema. */
  font: z.enum(FONT_CHOICES).default("system"),
  /** Ukuran kaca (border radius) dalam rem, 0–2. */
  kelengkungan: z.coerce.number().min(0).max(2).default(0.75),
  /** Judul besar beranda; kosong = pakai nama desa. */
  heroJudul: z.string().trim().max(120).default(""),
  /** Kalimat ajakan tombol utama beranda. */
  heroTombol: z.string().trim().max(60).default("Layanan Mandiri Warga"),
  /** Tautan tombol utama beranda. */
  heroTombolUrl: z.string().trim().max(255).default("/layanan-mandiri"),
  headerVarian: z.enum(HEADER_VARIANTS).default("terang"),
  /** Bagian yang ditampilkan pada beranda, sekaligus urutannya. */
  beranda: z.array(z.enum(HOME_SECTION_IDS)).min(1).default(DEFAULT_HOME_SECTIONS),
  /** Tampilkan menu utama di header. */
  tampilMenu: z.boolean().default(true),
  /** Tampilkan kolom kontak di footer. */
  tampilKontakFooter: z.boolean().default(true),
});

export type ThemeOptions = z.infer<typeof themeOptionsSchema>;

/** Opsi tema yang dianggap sebagai keadaan awal. */
export const THEME_DEFAULT_OPTIONS: ThemeOptions = themeOptionsSchema.parse({});

/** Manifest tema; dibaca dari registry (bukan dari input pengguna). */
export interface ThemeManifest {
  /** Slug unik; juga nama folder di `src/themes/`. */
  slug: string;
  nama: string;
  versi: string;
  /** Deskripsi singkat untuk kartu pilihan tema. */
  deskripsi: string;
  /** Warna aksen untuk pratinjau kartu admin. */
  warnaPratinjau: string;
  /** Slot halaman yang diimplementasikan tema. */
  slot: readonly ThemeSlot[];
  /** Tata letak: `sidebar` (kolom samping) atau `polos` (satu kolom). */
  tataLetak: "sidebar" | "polos";
}

/** Tema bawaan bila desa belum punya tema aktif. */
export const DEFAULT_THEME_SLUG = "esensi";

/** Apakah `slug` merupakan salah satu slot tema yang dikenal? */
export function isThemeSlot(value: string): value is ThemeSlot {
  return (THEME_SLOTS as readonly string[]).includes(value);
}

/**
 * Rapikan opsi mentah menjadi opsi tervalidasi.
 *
 * Menerima `unknown` (mis. hasil `JSON.parse`) atau `null`; nilai yang tidak
 * valid diganti bawaan alih-alih melempar, agar satu baris data lama tidak
 * membuat seluruh situs publik gagal dirender.
 */
export function parseThemeOptions(raw: unknown): ThemeOptions {
  if (raw === null || raw === undefined) return THEME_DEFAULT_OPTIONS;

  let nilai: unknown = raw;
  if (typeof raw === "string") {
    try {
      nilai = JSON.parse(raw);
    } catch {
      return THEME_DEFAULT_OPTIONS;
    }
  }

  const hasil = themeOptionsSchema.safeParse(nilai);
  if (hasil.success) return normalisasiBeranda(hasil.data);

  // Coba lengkapi dengan bawaan dulu (mis. hanya sebagian field yang tersimpan).
  const sebagian = themeOptionsSchema.partial().safeParse(nilai);
  if (sebagian.success) {
    return normalisasiBeranda(themeOptionsSchema.parse(sebagian.data));
  }

  return THEME_DEFAULT_OPTIONS;
}

/** Buang bagian beranda yang duplikat tanpa mengubah urutan pilihan. */
function normalisasiBeranda(opsi: ThemeOptions): ThemeOptions {
  const unik = Array.from(new Set(opsi.beranda));
  return unik.length > 0 ? { ...opsi, beranda: unik } : theDefaultOptions(opsi);
}

function theDefaultOptions(opsi: ThemeOptions): ThemeOptions {
  return { ...opsi, beranda: [...DEFAULT_HOME_SECTIONS] };
}

/** Susun nilai CSS variable dari opsi tema (dipakai wrapper situs publik). */
export function themeCssVars(opsi: ThemeOptions): Record<string, string> {
  return {
    "--pub-primary": opsi.warnaPrimer,
    "--pub-primary-foreground": kontrasTeks(opsi.warnaPrimer),
    "--pub-secondary": opsi.warnaSekunder,
    "--pub-radius": `${opsi.kelengkungan}rem`,
    "--pub-font": fontFamily(opsi.font),
  };
}

/** Pilih warna teks (putih/hitam) agar kontras terhadap latar. */
export function kontrasTeks(heks: string): string {
  const bersih = heks.replace("#", "");
  const r = Number.parseInt(bersih.slice(0, 2), 16);
  const g = Number.parseInt(bersih.slice(2, 4), 16);
  const b = Number.parseInt(bersih.slice(4, 6), 16);
  // Luminansi perseptual sederhana (ITU-R BT.601).
  const luminansi = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminansi > 0.6 ? "#0b0b0b" : "#ffffff";
}

function fontFamily(font: FontChoice): string {
  switch (font) {
    case "serif":
      return 'ui-serif, Georgia, "Times New Roman", serif';
    case "sans":
      return 'ui-sans-serif, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    default:
      return "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)";
  }
}
