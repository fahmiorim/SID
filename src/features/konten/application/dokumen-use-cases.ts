"use server";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  listDokumenPublik,
  type DokumenRingkas,
} from "@/features/publik/infrastructure/content-repository";
import { requirePermission } from "@/lib/dal";

export async function daftarDokumen(): Promise<DokumenRingkas[]> {
  const user = await requirePermission("dokumen-publik", "read");
  const villageId = await resolveVillageId(user);
  return listDokumenPublik(villageId);
}
