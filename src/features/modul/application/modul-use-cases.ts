import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { MODUL_RESOURCE, type ModulFormInput } from "@/features/modul/domain/modul";
import {
  createModul,
  deleteModul,
  listModul,
  updateModul,
} from "@/features/modul/infrastructure/modul-repository";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";
import { NO_SELECTION } from "@/lib/forms";

/** Slug yang dipakai kode aplikasi; tidak boleh diubah/dihapus lewat UI. */
const CORE_SLUGS = new Set<string>(Object.values(RESOURCES));

function toParentId(val: string | undefined): number | null {
  if (!val || val === NO_SELECTION) return null;
  const n = Number(val);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function findModulById<T extends { id: number }>(modules: readonly T[], id: number): T {
  const modul = modules.find((m) => m.id === id);
  if (!modul) throw notFound("Modul tidak ditemukan.");
  return modul;
}

/** Induk harus modul tingkat atas pada desa yang sama (mencegah siklus/kedalaman liar). */
function validateParent(
  modules: readonly { id: number; parentId: number | null }[],
  parentId: number | null,
  selfId?: number,
): void {
  if (parentId === null) return;
  if (parentId === selfId) throw conflict("Modul tidak dapat menjadi induk dirinya sendiri.");

  const parent = modules.find((m) => m.id === parentId);
  if (!parent || parent.parentId !== null) {
    throw conflict("Induk modul harus modul tingkat atas.");
  }
}

export async function listModulWithMeta() {
  const user = await requirePermission(MODUL_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listModul(villageId);
}

export async function createModulData(input: ModulFormInput) {
  const user = await requirePermission(MODUL_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const parentId = toParentId(input.parentId);

  const existing = await listModul(villageId);
  if (existing.some((m) => m.slug.toLowerCase() === input.slug.toLowerCase())) {
    throw conflict("Slug modul sudah digunakan.");
  }
  if (existing.some((m) => m.name.toLowerCase() === input.name.toLowerCase())) {
    throw conflict("Nama modul sudah digunakan.");
  }
  validateParent(existing, parentId);

  const data = await createModul({
    villageId,
    parentId,
    slug: input.slug,
    name: input.name,
    url: input.url || null,
    icon: input.icon || null,
    isGroup: input.isGroup ?? false,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });
  return { id: data.id };
}

export async function updateModulData(id: number, input: ModulFormInput) {
  const user = await requirePermission(MODUL_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const parentId = toParentId(input.parentId);

  const existing = await listModul(villageId);
  const modul = findModulById(existing, id);

  if (CORE_SLUGS.has(modul.slug) && input.slug !== modul.slug) {
    throw conflict("Slug modul inti tidak dapat diubah.");
  }

  if (existing.some((m) => m.id !== id && m.slug.toLowerCase() === input.slug.toLowerCase())) {
    throw conflict("Slug modul sudah digunakan.");
  }
  if (existing.some((m) => m.id !== id && m.name.toLowerCase() === input.name.toLowerCase())) {
    throw conflict("Nama modul sudah digunakan.");
  }
  validateParent(existing, parentId, id);

  await updateModul(id, {
    parentId,
    slug: input.slug,
    name: input.name,
    url: input.url || null,
    icon: input.icon || null,
    isGroup: input.isGroup ?? false,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });
}

export async function deleteModulData(id: number) {
  const user = await requirePermission(MODUL_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const existing = await listModul(villageId);
  const modul = findModulById(existing, id);

  if (CORE_SLUGS.has(modul.slug)) {
    throw conflict("Modul inti tidak dapat dihapus. Nonaktifkan saja bila perlu.");
  }
  if (existing.some((m) => m.parentId === id)) {
    throw conflict("Hapus atau pindahkan submodul terlebih dahulu.");
  }

  await deleteModul(id);
}
