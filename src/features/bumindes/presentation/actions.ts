"use server";

import { revalidatePath } from "next/cache";

import {
  ensureBumindesBuku,
  getBumindesBuku,
  listBumindesItem,
  tambahItemBumindes,
} from "@/features/bumindes/infrastructure/bumindes-repository";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";
import { requirePermission } from "@/lib/dal";

const PATH = "/bumindes/buku-administrasi";

export async function getBumindesData() {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);
  const buku = await ensureBumindesBuku(villageId);
  return { buku };
}

export async function getBumindesDetail(bukuId: number) {
  const user = await requirePermission(RESOURCES.bumindes, "read");
  const villageId = await resolveVillageId(user);

  const buku = await getBumindesBuku(villageId, bukuId);
  if (!buku) return null;

  const items = await listBumindesItem(villageId, bukuId);
  return { buku, items };
}

export async function tambahItemBumindesAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission(RESOURCES.bumindes, "update");
  const villageId = await resolveVillageId(user);
  const bukuId = Number(formData.get("bukuId"));
  const nomorUrut = Number(formData.get("nomorUrut") || 0);
  const uraian = String(formData.get("uraian") || "").trim();
  const tanggal = String(formData.get("tanggal") || "") || null;
  const keterangan = String(formData.get("keterangan") || "") || null;

  if (!Number.isInteger(bukuId) || bukuId < 1 || !uraian) {
    return errorState("Data tidak valid.");
  }

  try {
    await tambahItemBumindes(villageId, {
      bukuId,
      nomorUrut,
      tanggal,
      uraian,
      keterangan,
    });
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${bukuId}`);
    return successState("Item ditambahkan.");
  } catch (error) {
    return toErrorState(error);
  }
}
