import "server-only";

import { eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { modules } from "@/db/schema";
import type { ModulDTO } from "@/features/modul/domain/modul";

const moduleColumns = {
  id: modules.id,
  parentId: modules.parentId,
  slug: modules.slug,
  name: modules.name,
  url: modules.url,
  icon: modules.icon,
  isGroup: modules.isGroup,
  isActive: modules.isActive,
  sortOrder: modules.sortOrder,
  isHidden: modules.isHidden,
};

export async function listModul(villageId: number | null): Promise<ModulDTO[]> {
  const rows = await db
    .select(moduleColumns)
    .from(modules)
    .where(villageId === null ? isNull(modules.villageId) : eq(modules.villageId, villageId))
    .orderBy(modules.sortOrder, modules.name);

  return rows.map((r) => ({
    ...r,
    parentId: r.parentId === 0 ? null : r.parentId,
  }));
}

export async function getModulById(id: number): Promise<ModulDTO | null> {
  const [row] = await db.select(moduleColumns).from(modules).where(eq(modules.id, id)).limit(1);

  if (!row) return null;
  return {
    ...row,
    parentId: row.parentId === 0 ? null : row.parentId,
  };
}

export async function createModul(input: {
  villageId: number | null;
  parentId: number | null;
  slug: string;
  name: string;
  url: string | null;
  icon: string | null;
  isGroup: boolean;
  isActive: boolean;
  sortOrder: number;
}): Promise<ModulDTO> {
  const [inserted] = await db
    .insert(modules)
    .values({
      villageId: input.villageId,
      parentId: input.parentId ?? 0,
      slug: input.slug,
      name: input.name,
      url: input.url,
      icon: input.icon,
      isGroup: input.isGroup,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    })
    .$returningId();

  if (!inserted) throw new Error("Gagal membuat modul.");

  const modul = await getModulById(inserted.id);
  if (!modul) throw new Error("Gagal mengambil modul baru.");
  return modul;
}

export async function updateModul(
  id: number,
  input: {
    parentId: number | null;
    slug: string;
    name: string;
    url: string | null;
    icon: string | null;
    isGroup: boolean;
    isActive: boolean;
    sortOrder: number;
  },
): Promise<void> {
  await db
    .update(modules)
    .set({
      parentId: input.parentId ?? 0,
      slug: input.slug,
      name: input.name,
      url: input.url,
      icon: input.icon,
      isGroup: input.isGroup,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    })
    .where(eq(modules.id, id));
}

export async function deleteModul(id: number): Promise<void> {
  await db.delete(modules).where(eq(modules.id, id));
}
