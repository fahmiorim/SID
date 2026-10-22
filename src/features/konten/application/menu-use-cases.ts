"use server";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { MENU_RESOURCE } from "@/features/konten/domain/menu";
import {
  createMenuPublik,
  deleteMenuPublik,
  listMenuPublik,
  updateMenuPublik,
  type MenuPublikRingkas,
} from "@/features/publik/infrastructure/content-repository";
import { requirePermission } from "@/lib/dal";

export interface ListMenuParams {
  search: string;
  status: string;
  page: number;
  pageSize?: number;
}

export type ListMenuResult = MenuPublikRingkas[];

export async function listMenu(_params: ListMenuParams): Promise<ListMenuResult> {
  const user = await requirePermission(MENU_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listMenuPublik(villageId) as unknown as ListMenuResult;
}

export async function getMenu(id: number): Promise<MenuPublikRingkas | undefined> {
  const user = await requirePermission(MENU_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  // Will need a getMenuPublik function in repository, using list for now
  const menus = (await listMenuPublik(villageId)) as unknown as MenuPublikRingkas[];
  return menus.find((m: MenuPublikRingkas) => m.id === id);
}

export async function createMenu(data: {
  nama: string;
  link: string;
  linkTipe: string;
  parentId?: number;
  urut?: number;
}): Promise<void> {
  const user = await requirePermission(MENU_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  await createMenuPublik(villageId, data);
}

export async function updateMenu(
  id: number,
  data: Partial<{ nama: string; link: string; linkTipe: string; parentId?: number; urut?: number }>,
): Promise<void> {
  const user = await requirePermission(MENU_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  await updateMenuPublik(villageId, id, data);
}

export async function deleteMenu(id: number): Promise<void> {
  const user = await requirePermission(MENU_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  await deleteMenuPublik(villageId, id);
}
