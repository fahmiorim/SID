import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { requirePermission } from "@/lib/dal";
import { validationError } from "@/lib/errors";

import {
  getAllMediaSettings as domainGetAllMediaSettings,
  getMediaSettings as domainGetMediaSettings,
  resetMediaSettings as domainResetMediaSettings,
  upsertMediaSettings as domainUpsertMediaSettings,
  type KategoriLampiran,
  type MediaSettingsEfektif,
  type MediaSettingsInput,
} from "../domain/pengaturan-berkas";

/**
 * Ambil seluruh pengaturan untuk desa saat ini.
 */
export async function getAllMediaSettingsAction(): Promise<MediaSettingsEfektif[]> {
  const user = await requirePermission("surat", "read");
  const villageId = await resolveVillageId(user);
  return domainGetAllMediaSettings(villageId);
}

/**
 * Ambil pengaturan untuk satu kategori.
 */
export async function getMediaSettingsAction(
  kategori: KategoriLampiran,
): Promise<MediaSettingsEfektif> {
  const user = await requirePermission("surat", "read");
  const villageId = await resolveVillageId(user);
  return domainGetMediaSettings(villageId, kategori);
}

/**
 * Simpan pengaturan untuk satu kategori.
 */
export async function saveMediaSettingsAction(input: MediaSettingsInput): Promise<void> {
  const user = await requirePermission("surat", "update");
  const villageId = await resolveVillageId(user);

  // Validasi input
  if (!input.kategori) {
    throw validationError("Kategori harus diisi.");
  }

  if (input.mimeAllowlist) {
    for (const m of input.mimeAllowlist) {
      if (typeof m !== "string" || !m.includes("/")) {
        throw validationError(`MIME tidak valid: "${m}".`);
      }
    }
  }

  if (input.maxFiles !== null && (input.maxFiles < 0 || input.maxFiles > 100)) {
    throw validationError("Jumlah file maksimal harus antara 1-100.");
  }

  if (input.maxSizeMb !== null && (input.maxSizeMb < 0.1 || input.maxSizeMb > 500)) {
    throw validationError("Ukuran file maksimal harus antara 0.1-500 MB.");
  }

  await domainUpsertMediaSettings(villageId, input);
}

/**
 * Reset pengaturan untuk satu kategori (kembali ke default).
 */
export async function resetMediaSettingsAction(kategori: KategoriLampiran): Promise<void> {
  const user = await requirePermission("surat", "update");
  const villageId = await resolveVillageId(user);
  await domainResetMediaSettings(villageId, kategori);
}

/**
 * Hapus pengaturan untuk satu kategori (alias reset).
 */
export async function deleteMediaSettingsAction(kategori: KategoriLampiran): Promise<void> {
  await resetMediaSettingsAction(kategori);
}
