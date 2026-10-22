import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { requirePermission } from "@/lib/dal";
import { sanitasiHtml } from "@/lib/sanitize";

import {
  PROFIL_DESA_RESOURCE,
  type ProfilDesaAdmin,
  type ProfilDesaFormInput,
} from "../domain/profil";
import { getProfilAdmin, upsertProfil } from "../infrastructure/profil-repository";

/**
 * Use case profil desa (Fase 1F.4).
 *
 * Desa berasal dari sesi. `sejarah` dan `sambutan` boleh berisi HTML, sehingga
 * disanitasi sebelum disimpan (lapisan kedua tetap ada saat dirender).
 */

export async function getProfil(): Promise<ProfilDesaAdmin> {
  const user = await requirePermission(PROFIL_DESA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return getProfilAdmin(villageId);
}

export async function simpanProfil(input: ProfilDesaFormInput): Promise<void> {
  const user = await requirePermission(PROFIL_DESA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await upsertProfil(villageId, {
    visi: input.visi.trim(),
    misi: input.misi.trim(),
    sejarah: bersihkanHtml(input.sejarah),
    sambutan: bersihkanHtml(input.sambutan),
    koordinat: input.koordinat.trim(),
  });
}

/** Sanitasi HTML profil; teks kosong tetap kosong. */
function bersihkanHtml(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return sanitasiHtml(trimmed, { gambar: false });
}
