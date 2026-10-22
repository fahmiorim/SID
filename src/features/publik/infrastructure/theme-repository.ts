import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { theme } from "@/db/schema";
import { getThemeManifest, isThemeSlug } from "@/themes/registry";

import { DEFAULT_THEME_SLUG, type ThemeManifest } from "../domain/theme";

/**
 * Penyimpanan pilihan tema (Fase 1D.1).
 *
 * Setiap desa punya banyak baris (satu per tema terpasang) tetapi hanya **satu**
 * yang `aktif`. Semua fungsi menerima `villageId` dari host/sesi — tidak pernah
 * dari input klien.
 */

export interface ThemeRow {
  slug: string;
  nama: string;
  versi: string;
  sumber: string;
  aktif: boolean;
}

/** Daftar tema yang tercatat untuk sebuah desa. */
export async function listThemes(villageId: number): Promise<ThemeRow[]> {
  return db
    .select({
      slug: theme.slug,
      nama: theme.nama,
      versi: theme.versi,
      sumber: theme.sumber,
      aktif: theme.aktif,
    })
    .from(theme)
    .where(eq(theme.villageId, villageId));
}

/** Baris tema aktif sebuah desa, atau `null` bila belum diatur. */
export async function getActiveTheme(
  villageId: number,
): Promise<{ slug: string; opsi: string | null } | null> {
  const [row] = await db
    .select({ slug: theme.slug, opsi: theme.opsi })
    .from(theme)
    .where(and(eq(theme.villageId, villageId), eq(theme.aktif, true)))
    .limit(1);
  return row ?? null;
}

/**
 * Pasang/segarkan sebuah tema untuk desa (idempoten).
 *
 * `aktif` hanya diubah bila argumen diberikan; memanggil ulang saat menyimpan
 * opsi tidak boleh mengaktifkan tema yang belum dipilih.
 */
export async function upsertTheme(
  villageId: number,
  manifest: ThemeManifest,
  opsiJson: string,
  aktif?: boolean,
): Promise<void> {
  const values = {
    villageId,
    slug: manifest.slug,
    nama: manifest.nama,
    versi: manifest.versi,
    sumber: "bawaan",
    opsi: opsiJson,
    ...(aktif === undefined ? {} : { aktif }),
  };

  await db
    .insert(theme)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        nama: manifest.nama,
        versi: manifest.versi,
        sumber: "bawaan",
        opsi: opsiJson,
        ...(aktif === undefined ? {} : { aktif }),
      },
    });
}

/**
 * Aktifkan satu tema dan nonaktifkan sisanya **dalam satu transaksi** agar tidak
 * pernah ada dua tema aktif (yang membuat situs publik ambigu).
 */
export async function setActiveTheme(villageId: number, slug: string): Promise<void> {
  const manifest = getThemeManifest(slug);
  if (!manifest) throw new Error(`Tema "${slug}" tidak terpasang.`);

  await db.transaction(async (tx) => {
    await tx.update(theme).set({ aktif: false }).where(eq(theme.villageId, villageId));
    await tx
      .insert(theme)
      .values({
        villageId,
        slug: manifest.slug,
        nama: manifest.nama,
        versi: manifest.versi,
        sumber: "bawaan",
        aktif: true,
      })
      .onDuplicateKeyUpdate({ set: { aktif: true, nama: manifest.nama, versi: manifest.versi } });
  });
}

/** Pastikan baris tema aktif ada; dipakai seeder sebagai keadaan awal. */
export async function ensureDefaultTheme(villageId: number): Promise<void> {
  const ada = await getActiveTheme(villageId);
  if (ada && isThemeSlug(ada.slug)) return;

  await setActiveTheme(villageId, DEFAULT_THEME_SLUG);
}
