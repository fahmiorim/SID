import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import type {
  InventarisInput,
  InventarisKategoriInput,
  InventarisMutasiInput,
} from "@/features/inventaris/domain/inventaris";
import {
  createInventaris,
  createInventarisKategori,
  createMutasi,
  getInventaris,
  listInventaris,
  listInventarisKategori,
  listMutasi,
  setujuiMutasi,
  softDeleteInventaris,
  tolakMutasi,
  updateInventaris,
  updateInventarisKategori,
} from "@/features/inventaris/infrastructure/inventaris-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

const INVENTARIS_RESOURCE = RESOURCES.inventaris;

export async function getInventarisPageData(search: string) {
  const user = await requirePermission(INVENTARIS_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  const [kategori, data] = await Promise.all([
    listInventarisKategori(villageId),
    listInventaris(villageId, search),
  ]);
  return {
    kategori,
    ...data,
    canManage: hasPermission(user.permissions, INVENTARIS_RESOURCE, "delete"),
  };
}

export async function saveInventarisKategori(input: InventarisKategoriInput, id?: number) {
  const user = await requirePermission(INVENTARIS_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  if (id) {
    await updateInventarisKategori(villageId, id, input);
    return;
  }
  await createInventarisKategori(villageId, input);
}

export async function saveInventaris(input: InventarisInput, id?: number) {
  const user = await requirePermission(INVENTARIS_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  if (id) {
    await updateInventaris(villageId, id, input);
    return;
  }
  const newId = await createInventaris(villageId, input);
  if (!newId) throw conflict("Gagal menyimpan inventaris");
  return { id: newId };
}

export async function hapusInventaris(id: number) {
  const user = await requirePermission(INVENTARIS_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  const item = await getInventaris(villageId, id);
  if (!item) throw notFound("Data inventaris tidak ditemukan");
  await softDeleteInventaris(villageId, id);
}

export async function ajukanMutasi(input: InventarisMutasiInput) {
  const user = await requirePermission(INVENTARIS_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const item = await getInventaris(villageId, input.inventarisId);
  if (!item) throw notFound("Data inventaris tidak ditemukan");
  await createMutasi(villageId, input);
}

export async function setujuiMutasiData(id: number) {
  const user = await requirePermission(INVENTARIS_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  await setujuiMutasi(villageId, id, user.name || user.id);
}

export async function tolakMutasiData(id: number, catatanPenolakan: string) {
  const user = await requirePermission(INVENTARIS_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  if (!catatanPenolakan.trim()) throw conflict("Catatan penolakan wajib diisi");
  await tolakMutasi(villageId, id, catatanPenolakan.trim());
}

export async function getMutasiPageData(inventarisId?: number) {
  const user = await requirePermission(INVENTARIS_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  const [data, kategori] = await Promise.all([
    listMutasi(villageId, inventarisId),
    listInventarisKategori(villageId),
  ]);
  return { rows: data, kategori };
}
