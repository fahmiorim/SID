"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  buatPermohonan,
  kembalikanPermohonan,
  listPermohonan,
  listSuratMandiri,
  prosesPermohonan,
} from "@/features/layanan-mandiri/infrastructure/layanan-mandiri-repository";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";
import { requirePermission } from "@/lib/dal";

const PATH = "/layanan-mandiri";

export async function getLayananMandiriData() {
  const user = await requirePermission(RESOURCES.permohonanSurat, "read");
  const villageId = await resolveVillageId(user);
  const [surat, permohonan] = await Promise.all([
    listSuratMandiri(villageId),
    listPermohonan(villageId),
  ]);
  return { surat, permohonan };
}

export async function ajukanSuratMandiriAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission(RESOURCES.permohonanSurat, "update");
  const villageId = await resolveVillageId(user);
  const letterTypeId = Number(formData.get("idSurat"));
  const residentId = Number(formData.get("idPemohon"));

  if (
    !Number.isInteger(letterTypeId) ||
    letterTypeId < 1 ||
    !Number.isInteger(residentId) ||
    residentId < 1
  ) {
    return errorState("Data tidak valid.");
  }

  try {
    await buatPermohonan({
      villageId,
      residentId,
      letterTypeId,
      isianForm: String(formData.get("isianForm") || ""),
      noHpAktif: String(formData.get("noHpAktif") || ""),
      keterangan: String(formData.get("keterangan") || ""),
      syarat: "[]",
    });
    revalidatePath(PATH);
    return successState("Permohonan surat diajukan.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function prosesPermohonanAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission(RESOURCES.permohonanSurat, "update");
  const villageId = await resolveVillageId(user);
  const id = Number(formData.get("id"));
  const status = Number(formData.get("status"));
  const alasan = String(formData.get("alasan") || "");

  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(status)) {
    return errorState("Data tidak valid.");
  }

  try {
    await prosesPermohonan(villageId, id, status, alasan);
    revalidatePath(PATH);
    return successState("Status permohonan diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function kembalikanPermohonanAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission(RESOURCES.permohonanSurat, "update");
  const villageId = await resolveVillageId(user);
  const id = Number(formData.get("id"));
  const alasan = String(formData.get("alasan") || "");

  if (!Number.isInteger(id) || id < 1) return errorState("Data tidak valid.");
  if (!alasan.trim()) return errorState("Alasan wajib diisi.");

  try {
    await kembalikanPermohonan(villageId, id, alasan.trim());
    revalidatePath(PATH);
    return successState("Permohonan dikembalikan.");
  } catch (error) {
    return toErrorState(error);
  }
}
