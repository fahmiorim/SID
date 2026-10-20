import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  HEAD_OF_FAMILY_RELATION_ID,
  PENDUDUK_RESOURCE,
  type LifeStatus,
  type PendudukFormInput,
  type PendudukReferenceData,
} from "@/features/penduduk/domain/penduduk";
import {
  deletePenduduk as deletePendudukRow,
  findPendudukById,
  headOfFamilyExists,
  insertPenduduk,
  listPenduduk as listPendudukRows,
  nationalIdExists,
  updatePenduduk as updatePendudukRow,
  type PendudukListResult,
} from "@/features/penduduk/infrastructure/penduduk-repository";
import { getPendudukReferenceData } from "@/features/penduduk/infrastructure/reference-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

/**
 * Lapisan aplikasi (use case) untuk penduduk.
 *
 * Setiap use case menegakkan izinnya sendiri lewat `requirePermission`, jadi
 * pemanggil mana pun (Server Action, Route Handler, skrip) otomatis terlindungi.
 */

export interface ListPendudukParams {
  search: string;
  lifeStatus: LifeStatus | null;
  page: number;
  pageSize: number;
}

export async function listPenduduk(params: ListPendudukParams): Promise<PendudukListResult> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  return listPendudukRows({ villageId, ...params });
}

/** Data referensi untuk mengisi formulir (butuh izin baca modul penduduk). */
export async function getPendudukReference(): Promise<PendudukReferenceData> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  return getPendudukReferenceData(villageId);
}

/** Pastikan sebuah KK tidak punya lebih dari satu kepala keluarga. */
async function ensureSingleHeadOfFamily(
  villageId: number,
  input: PendudukFormInput,
  excludeId: number | null,
): Promise<void> {
  if (input.familyId === null || input.familyRelationId !== HEAD_OF_FAMILY_RELATION_ID) return;

  if (await headOfFamilyExists(villageId, input.familyId, excludeId)) {
    throw conflict("Kartu Keluarga tersebut sudah memiliki kepala keluarga.");
  }
}

export async function createPenduduk(input: PendudukFormInput): Promise<{ id: number }> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (input.nationalId !== null && (await nationalIdExists(villageId, input.nationalId, null))) {
    throw conflict("NIK tersebut sudah terdaftar pada penduduk lain.");
  }

  await ensureSingleHeadOfFamily(villageId, input, null);

  const id = await insertPenduduk(villageId, input);
  return { id };
}

export async function updatePenduduk(id: number, input: PendudukFormInput): Promise<void> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const existing = await findPendudukById(villageId, id);
  if (!existing) throw notFound("Data penduduk tidak ditemukan.");

  if (input.nationalId !== null && (await nationalIdExists(villageId, input.nationalId, id))) {
    throw conflict("NIK tersebut sudah terdaftar pada penduduk lain.");
  }

  await ensureSingleHeadOfFamily(villageId, input, id);

  await updatePendudukRow(id, input);
}

export async function deletePenduduk(id: number): Promise<void> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const existing = await findPendudukById(villageId, id);
  if (!existing) throw notFound("Data penduduk tidak ditemukan.");

  await deletePendudukRow(id);
}
