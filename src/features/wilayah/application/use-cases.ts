import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { WILAYAH_RESOURCE, type WilayahFormInput } from "@/features/wilayah/domain/wilayah";
import {
  deleteWilayah as deleteWilayahRow,
  findWilayahById,
  insertWilayah,
  listWilayah as listWilayahRows,
  updateWilayah as updateWilayahRow,
  wilayahExists,
  type WilayahListResult,
} from "@/features/wilayah/infrastructure/wilayah-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

/**
 * Lapisan aplikasi (use case) untuk wilayah.
 *
 * Setiap use case **menegakkan izin sendiri** lewat `requirePermission`, jadi
 * pemanggil mana pun (Server Action, Route Handler, skrip) otomatis terlindungi.
 */

export interface ListWilayahParams {
  search: string;
  page: number;
  pageSize: number;
}

export async function listWilayah(params: ListWilayahParams): Promise<WilayahListResult> {
  const user = await requirePermission(WILAYAH_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  return listWilayahRows({ villageId, ...params });
}

export async function createWilayah(input: WilayahFormInput): Promise<{ id: number }> {
  const user = await requirePermission(WILAYAH_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (await wilayahExists(villageId, input, null)) {
    throw conflict("Wilayah dengan kombinasi dusun/RW/RT tersebut sudah ada.");
  }

  const id = await insertWilayah(villageId, input);
  return { id };
}

export async function updateWilayah(id: number, input: WilayahFormInput): Promise<void> {
  const user = await requirePermission(WILAYAH_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const existing = await findWilayahById(villageId, id);
  if (!existing) throw notFound("Data wilayah tidak ditemukan.");

  if (await wilayahExists(villageId, input, id)) {
    throw conflict("Wilayah dengan kombinasi dusun/RW/RT tersebut sudah ada.");
  }

  await updateWilayahRow(id, input);
}

export async function deleteWilayah(id: number): Promise<void> {
  const user = await requirePermission(WILAYAH_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const existing = await findWilayahById(villageId, id);
  if (!existing) throw notFound("Data wilayah tidak ditemukan.");

  await deleteWilayahRow(id);
}
