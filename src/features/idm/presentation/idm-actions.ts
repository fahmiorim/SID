"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  daftarIdm,
  hapusIdm,
  hapusSdgs,
  simpanIdm,
  simpanSdgs,
} from "../application/idm-use-cases";

export async function listIdmAction(tahun?: number) {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarIdm(user.villageId, tahun);
}

/** Revalidasi seluruh rute yang menampilkan data IDM/SDGs. */
function segarkan() {
  revalidatePath("/desa/idm");
  revalidatePath("/(admin)/desa/idm");
  revalidatePath("/desa/idm-sdgs");
  revalidatePath("/(admin)/desa/idm-sdgs");
}

export async function saveIdmAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = formData.get("id");
    const input = {
      ...(id ? { id } : {}),
      tahun: formData.get("tahun"),
      kode: formData.get("kode"),
      nama: formData.get("nama"),
      skor: formData.get("skor"),
      kategori: formData.get("kategori"),
      keterangan: formData.get("keterangan"),
    };
    const result = await simpanIdm(user.villageId, input);
    segarkan();
    return successState("Data IDM berhasil disimpan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menyimpan data IDM.");
  }
}

export async function hapusIdmAction(id: number): Promise<ActionState<null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    await hapusIdm(user.villageId, id);
    segarkan();
    return successState("Indikator IDM dihapus.", null);
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus indikator.");
  }
}

export async function saveSdgsAction(
  _prev: ActionState<{ goal: number } | null>,
  formData: FormData,
): Promise<ActionState<{ goal: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      tahun: formData.get("tahun"),
      goal: formData.get("goal"),
      skor: formData.get("skor"),
      keterangan: formData.get("keterangan"),
    };
    const result = await simpanSdgs(user.villageId, input);
    revalidatePath("/desa/idm-sdgs");
    revalidatePath("/(admin)/desa/idm-sdgs");
    return successState("Capaian SDGs disimpan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menyimpan capaian SDGs.");
  }
}

export async function hapusSdgsAction(tahun: number, goal: number): Promise<ActionState<null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    await hapusSdgs(user.villageId, tahun, goal);
    revalidatePath("/desa/idm-sdgs");
    revalidatePath("/(admin)/desa/idm-sdgs");
    return successState("Capaian SDGs dihapus.", null);
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus capaian SDGs.");
  }
}
