import { DEFAULT_THEME_SLUG, type ThemeManifest } from "@/features/publik/domain/theme";

import { esensi } from "./esensi";
import type { ThemeComponents } from "./kontrak";
import { THEME_MANIFESTS } from "./manifests";
import { natra } from "./natra";

/**
 * Registry tema (Fase 1D.4).
 *
 * Peta **statis** slug → paket komponen. Tidak ada `import()` dinamis dari input
 * pengguna: slug yang tidak ada di sini ditolak, sehingga unggahan tema saat
 * runtime tidak mungkin mengeksekusi kode tak tepercaya.
 *
 * Menambah tema = tambah folder `src/themes/<slug>/` (manifest + komponen), lalu
 * daftarkan di sini. Perubahan seperti itu memerlukan build & deploy ulang —
 * batasan ini disengaja dan didokumentasikan di `docs/ARCHITECTURE.md`.
 */
const REGISTRY: Record<string, ThemeComponents> = {
  [esensi.manifest.slug]: esensi,
  [natra.manifest.slug]: natra,
};

/** Semua manifest tema, terurut sesuai urutan pendaftaran di registry. */
export function listThemeManifests(): ThemeManifest[] {
  return THEME_MANIFESTS.filter((manifest) => manifest.slug in REGISTRY);
}

/** Paket komponen sebuah tema, atau `null` bila slug tidak dikenal. */
export function getTheme(slug: string): ThemeComponents | null {
  return REGISTRY[slug] ?? null;
}

/** Manifest sebuah tema, atau `null`. */
export function getThemeManifest(slug: string): ThemeManifest | null {
  return REGISTRY[slug]?.manifest ?? null;
}

/** Tema bawaan (dipakai saat desa belum punya tema aktif atau slug tak dikenal). */
export function getDefaultTheme(): ThemeComponents {
  const bawaan = REGISTRY[DEFAULT_THEME_SLUG];
  if (!bawaan) throw new Error(`Tema bawaan "${DEFAULT_THEME_SLUG}" tidak terdaftar di registry.`);
  return bawaan;
}

/** Apakah `slug` merujuk tema terdaftar? */
export function isThemeSlug(slug: string): boolean {
  return slug in REGISTRY;
}

/**
 * Paket komponen untuk sebuah slug, dengan fallback ke tema bawaan.
 *
 * Dipakai jalur render publik: slug tak dikenal (mis. sisa data lama) tidak boleh
 * membuat seluruh situs gagal, tetapi juga tidak boleh mengeksekusi apa pun dari
 * luar registry.
 */
export function resolveTheme(slug: string): ThemeComponents {
  return getTheme(slug) ?? getDefaultTheme();
}
