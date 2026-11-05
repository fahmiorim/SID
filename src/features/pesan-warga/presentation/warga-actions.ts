"use server";

import { revalidatePath } from "next/cache";

import { successState, toErrorState, type ActionState } from "@/lib/action-state";

import { kirimPesanWargaData } from "../application/pesan-warga-use-cases";

export async function kirimPesanWargaAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  try {
    await kirimPesanWargaData({ isi: formData.get("isi") });
    revalidatePath("/layanan-mandiri/pesan");
    revalidatePath("/layanan-mandiri/beranda");
    return successState("Pesan terkirim ke operator desa.");
  } catch (error) {
    return toErrorState(error);
  }
}
