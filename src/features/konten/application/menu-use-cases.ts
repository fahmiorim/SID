import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  cekParentMenu,
  MENU_RESOURCE,
  type MenuPublikFormInput,
  type MenuRow,
} from "@/features/konten/domain/menu";
import {
  createMenuPublik,
  deleteMenuPublik,
  listMenuPublik,
  updateMenuPublik,
} from "@/features/publik/infrastructure/content-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

/** Daftar seluruh menu desa, termasuk yang nonaktif, untuk halaman admin. */
export async function listMenu(): Promise<MenuRow[]> {
  const user = await requirePermission(MENU_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listMenuPublik(villageId, true);
}

/** Simpan menu baru atau ubah menu yang sudah ada. */
export async function saveMenu(input: MenuPublikFormInput, id?: number): Promise<void> {
  const user = await requirePermission(MENU_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const rows = await listMenuPublik(villageId, true);

  if (id !== undefined && !rows.some((row) => row.id === id)) {
    throw notFound("Menu yang akan diubah tidak ditemukan.");
  }

  const parentError = cekParentMenu(rows, input.parentId ?? null, id);
  if (parentError) throw conflict(parentError);

  if (id !== undefined && input.parentId != null && rows.some((row) => row.parentId === id)) {
    throw conflict("Menu yang memiliki submenu tidak bisa dijadikan submenu.");
  }

  const data = {
    nama: input.nama,
    link: input.link,
    linkTipe: input.linkTipe,
    parentId: input.parentId ?? null,
    urut: input.urut,
    aktif: input.aktif,
  };

  if (id === undefined) {
    await createMenuPublik(villageId, data);
    return;
  }

  await updateMenuPublik(villageId, id, data);
}

export async function deleteMenu(id: number): Promise<void> {
  const user = await requirePermission(MENU_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  const rows = await listMenuPublik(villageId, true);

  if (!rows.some((row) => row.id === id)) {
    throw notFound("Menu yang akan dihapus tidak ditemukan.");
  }

  if (rows.some((row) => row.parentId === id)) {
    throw conflict("Menu masih memiliki submenu. Hapus atau pindahkan submenu terlebih dahulu.");
  }

  await deleteMenuPublik(villageId, id);
}
