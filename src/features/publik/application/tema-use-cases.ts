import "server-only";

import { cache } from "react";

import { recordAuditEvent } from "@/features/audit/application/audit-use-cases";
import { AUDIT_EVENTS } from "@/features/audit/domain/audit";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { requirePermission } from "@/lib/dal";
import { getDefaultTheme, getThemeManifest, listThemeManifests } from "@/themes/registry";

import { TEMA_RESOURCE, type PengaturanTemaForm } from "../domain/tema";
import { pindaiManifestTema, ringkasMasalahTema } from "../domain/tema-scan";
import {
  parseThemeOptions,
  THEME_DEFAULT_OPTIONS,
  themeOptionsSchema,
  type ThemeManifest,
  type ThemeOptions,
} from "../domain/theme";
import { getActiveTheme, setActiveTheme, upsertTheme } from "../infrastructure/theme-repository";

/**
 * Use case tema publik (Fase 1D).
 *
 * Semua fungsi menerima `villageId` yang berasal dari sesi/host — bukan dari
 * input klien. Otorisasi tetap diperiksa di Server Action; fungsi di sini fokus
 * pada orkestrasi dan validasi.
 */

export interface TemaAktif {
  manifest: ThemeManifest;
  opsi: ThemeOptions;
}

/**
 * Tema efektif sebuah desa.
 *
 * Bila desa belum punya tema aktif (mis. instalasi lama), dipakai tema bawaan
 * agar situs publik tetap tampil alih-alih gagal.
 */
export const getTemaAktif = cache(async (villageId: number): Promise<TemaAktif> => {
  const row = await getActiveTheme(villageId);
  const manifest = (row && getThemeManifest(row.slug)) ?? getDefaultTheme().manifest;
  return { manifest, opsi: parseThemeOptions(row?.opsi ?? null) };
});

export interface KartuTema {
  manifest: ThemeManifest;
  aktif: boolean;
  /** Hasil pemindaian manifest build-time (OS-WEB-017). */
  valid: boolean;
  masalah: string[];
}

/**
 * Daftar tema terpasang untuk halaman admin, ditandai mana yang aktif dan
 * apakah manifestnya lengkap. Pemindaian dilakukan dari registry build, bukan
 * dari berkas yang diunggah pengguna.
 */
export async function listTemaUntukAdmin(villageId: number): Promise<KartuTema[]> {
  const aktif = await getActiveTheme(villageId);
  return listThemeManifests().map((manifest) => {
    const pindai = pindaiManifestTema(manifest);
    return {
      manifest,
      aktif: manifest.slug === aktif?.slug,
      valid: pindai.valid,
      masalah: pindai.masalah,
    };
  });
}

/** Simpan opsi tema aktif; nama/versi disegarkan dari manifest. */
export async function simpanOpsiTema(villageId: number, opsi: ThemeOptions): Promise<void> {
  const { manifest } = await getTemaAktif(villageId);
  await upsertTheme(villageId, manifest, JSON.stringify(opsi));
}

/* -------------------------------------------------------------------------- */
/* Jalur admin — otorisasi diperiksa di sini, bukan hanya di UI.               */
/* -------------------------------------------------------------------------- */

/** Pengaturan tema untuk halaman admin (butuh izin baca modul `tema`). */
export async function getPengaturanTema(): Promise<{
  aktif: TemaAktif;
  daftar: KartuTema[];
}> {
  const user = await requirePermission(TEMA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const [aktif, daftar] = await Promise.all([
    getTemaAktif(villageId),
    listTemaUntukAdmin(villageId),
  ]);

  return { aktif, daftar };
}

/** Simpan opsi tema aktif dari form admin (butuh izin ubah modul `tema`). */
export async function simpanPengaturanTema(input: PengaturanTemaForm): Promise<{ slug: string }> {
  const user = await requirePermission(TEMA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const opsi = {
    warnaPrimer: input.warnaPrimer,
    warnaSekunder: input.warnaSekunder,
    font: input.font,
    kelengkungan: input.kelengkungan,
    heroJudul: input.heroJudul,
    heroTombol: input.heroTombol || "Layanan Mandiri Warga",
    heroTombolUrl: input.heroTombolUrl || "/layanan-mandiri",
    headerVarian: input.headerVarian,
    beranda: input.beranda.length > 0 ? input.beranda : [...THEME_DEFAULT_OPTIONS.beranda],
    tampilMenu: input.tampilMenu,
    tampilKontakFooter: input.tampilKontakFooter,
    teksBerjalan: input.teksBerjalan,
    sosmed: input.sosmed,
  };

  const tervalidasi = themeOptionsSchema.safeParse(opsi);
  if (!tervalidasi.success) throw new Error("Opsi tema tidak valid.");

  const { manifest } = await getTemaAktif(villageId);
  await upsertTheme(villageId, manifest, JSON.stringify(tervalidasi.data));
  return { slug: manifest.slug };
}

/** Ganti tema aktif dari halaman admin (butuh izin ubah modul `tema`). */
export async function gantiTemaAktif(slug: string): Promise<void> {
  const user = await requirePermission(TEMA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const manifest = getThemeManifest(slug);
  if (!manifest) throw new Error("Tema tidak ditemukan pada registry build.");

  const pindai = pindaiManifestTema(manifest);
  if (!pindai.valid) {
    throw new Error(
      `Tema "${manifest.nama}" tidak dapat diaktifkan. ${ringkasMasalahTema(pindai)}`,
    );
  }

  await setActiveTheme(villageId, slug);

  await recordAuditEvent({
    villageId,
    actorId: user.id,
    event: AUDIT_EVENTS.temaActivate,
    resource: TEMA_RESOURCE,
    resourceId: slug,
  });
}
