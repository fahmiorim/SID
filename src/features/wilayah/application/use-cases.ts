import "server-only";

import { resolveConfigId } from "@/features/desa/application/resolve-config";
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
  const configId = await resolveConfigId(user);

  return listWilayahRows({ configId, ...params });
}

export async function createWilayah(input: WilayahFormInput): Promise<{ id: number }> {
  const user = await requirePermission(WILAYAH_RESOURCE, "update");
  const configId = await resolveConfigId(user);

  if (await wilayahExists(configId, input, null)) {
    throw conflict("Wilayah dengan kombinasi dusun/RW/RT tersebut sudah ada.");
  }

  const id = await insertWilayah(configId, input);
  return { id };
}

export async function updateWilayah(id: number, input: WilayahFormInput): Promise<void> {
  const user = await requirePermission(WILAYAH_RESOURCE, "update");
  const configId = await resolveConfigId(user);

  const existing = await findWilayahById(configId, id);
  if (!existing) throw notFound("Data wilayah tidak ditemukan.");

  if (await wilayahExists(configId, input, id)) {
    throw conflict("Wilayah dengan kombinasi dusun/RW/RT tersebut sudah ada.");
  }

  await updateWilayahRow(id, input);
}

export async function deleteWilayah(id: number): Promise<void> {
  const user = await requirePermission(WILAYAH_RESOURCE, "delete");
  const configId = await resolveConfigId(user);

  const existing = await findWilayahById(configId, id);
  if (!existing) throw notFound("Data wilayah tidak ditemukan.");

  await deleteWilayahRow(id);
}
