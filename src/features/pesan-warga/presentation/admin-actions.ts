"use server";

import { revalidatePath } from "next/cache";

import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

import { balasPesanWargaData } from "../application/pesan-warga-use-cases";

export async function balasPesanWargaAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  const residentId = Number(formData.get("residentId"));
  if (!Number.isInteger(residentId) || residentId < 1) {
    return errorState("Percakapan tidak ditemukan.");
  }

  try {
    await balasPesanWargaData(residentId, { isi: formData.get("isi") });
    revalidatePath("/pesan-warga");
    revalidatePath("/layanan-mandiri/pesan");
    return successState("Balasan terkirim ke warga.");
  } catch (error) {
    return toErrorState(error);
  }
}
