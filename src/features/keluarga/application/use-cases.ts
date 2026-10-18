import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  KELUARGA_RESOURCE,
  type KeluargaFormInput,
  type KeluargaMember,
  type KeluargaReferenceData,
} from "@/features/keluarga/domain/keluarga";
import {
  deleteKeluarga as deleteKeluargaRow,
  findKeluargaById,
  insertKeluarga,
  keluargaNumberExists,
  listKeluargaMembers as listKeluargaMembersRows,
  listKeluarga as listKeluargaRows,
  updateKeluarga as updateKeluargaRow,
  type KeluargaListResult,
} from "@/features/keluarga/infrastructure/keluarga-repository";
import { formatWilayahLabel } from "@/features/wilayah/domain/wilayah";
import { listWilayahOptions } from "@/features/wilayah/infrastructure/wilayah-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

/**
 * Lapisan aplikasi (use case) untuk keluarga.
 *
 * Setiap use case menegakkan izinnya sendiri lewat `requirePermission`, jadi
 * pemanggil mana pun (Server Action, Route Handler, skrip) otomatis terlindungi.
 */

export interface ListKeluargaParams {
  search: string;
  page: number;
  pageSize: number;
}

export async function listKeluarga(params: ListKeluargaParams): Promise<KeluargaListResult> {
  const user = await requirePermission(KELUARGA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  return listKeluargaRows({ villageId, ...params });
}

/** Data referensi untuk mengisi formulir (butuh izin baca modul keluarga). */
export async function getKeluargaReference(): Promise<KeluargaReferenceData> {
  const user = await requirePermission(KELUARGA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const regions = await listWilayahOptions(villageId);

  return {
    regions: regions.map((region) => ({ id: region.id, label: formatWilayahLabel(region) })),
  };
}

/** Anggota sebuah KK; dipakai dialog rincian pada UI. */
export async function listKeluargaMembers(familyId: number): Promise<KeluargaMember[]> {
  const user = await requirePermission(KELUARGA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const family = await findKeluargaById(villageId, familyId);
  if (!family) throw notFound("Kartu Keluarga tidak ditemukan.");

  return listKeluargaMembersRows(villageId, familyId);
}

export async function createKeluarga(input: KeluargaFormInput): Promise<{ id: number }> {
  const user = await requirePermission(KELUARGA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (await keluargaNumberExists(villageId, input.number, null)) {
    throw conflict("Nomor KK tersebut sudah terdaftar.");
  }

  const id = await insertKeluarga(villageId, input);
  return { id };
}

export async function updateKeluarga(id: number, input: KeluargaFormInput): Promise<void> {
  const user = await requirePermission(KELUARGA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const existing = await findKeluargaById(villageId, id);
  if (!existing) throw notFound("Kartu Keluarga tidak ditemukan.");

  if (await keluargaNumberExists(villageId, input.number, id)) {
    throw conflict("Nomor KK tersebut sudah terdaftar.");
  }

  await updateKeluargaRow(id, input);
}

export async function deleteKeluarga(id: number): Promise<void> {
  const user = await requirePermission(KELUARGA_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const existing = await findKeluargaById(villageId, id);
  if (!existing) throw notFound("Kartu Keluarga tidak ditemukan.");

  await deleteKeluargaRow(id);
}
