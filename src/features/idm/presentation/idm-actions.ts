"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import { daftarIdm, simpanIdm } from "../application/idm-use-cases";

export async function listIdmAction(tahun?: number) {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarIdm(user.villageId, tahun);
}

export async function saveIdmAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      tahun: formData.get("tahun"),
      kode: formData.get("kode"),
      nama: formData.get("nama"),
      skor: formData.get("skor"),
      kategori: formData.get("kategori"),
      keterangan: formData.get("keterangan"),
    };
    const result = await simpanIdm(user.villageId, input);
    revalidatePath("/desa/idm");
    revalidatePath("/(admin)/desa/idm");
    return successState("Data IDM berhasil disimpan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menyimpan data IDM.");
  }
}
