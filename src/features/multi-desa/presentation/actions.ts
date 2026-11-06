"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { isAppError } from "@/lib/errors";

import { buatDesaBaru } from "../application/provisioning-use-cases";

type DesaBaruState = ActionState<{ id: number } | null>;

export async function buatDesaAction(
  _prev: DesaBaruState,
  formData: FormData,
): Promise<DesaBaruState> {
  try {
    const input = {
      name: formData.get("name"),
      code: formData.get("code"),
      domain: formData.get("domain"),
      district: formData.get("district"),
      regency: formData.get("regency"),
      province: formData.get("province"),
      headName: formData.get("headName"),
      adminName: formData.get("adminName"),
      adminUsername: formData.get("adminUsername"),
      adminEmail: formData.get("adminEmail"),
      adminPassword: formData.get("adminPassword"),
    };

    const hasil = await buatDesaBaru(input);
    revalidatePath("/super-admin");

    return successState("Desa baru berhasil dibuat beserta akun adminnya.", hasil);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Periksa kembali isian desa.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal membuat desa baru.");
  }
}
