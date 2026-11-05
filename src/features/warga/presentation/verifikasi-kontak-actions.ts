"use server";

import { revalidatePath } from "next/cache";

import { successState, toErrorState, type ActionState } from "@/lib/action-state";

import {
  mintaVerifikasiKontakData,
  verifikasiKontakWargaData,
} from "../application/verifikasi-kontak-use-cases";

export async function mintaVerifikasiKontakAction(
  _prev: ActionState<{ terkirim: boolean } | null>,
  formData: FormData,
): Promise<ActionState<{ terkirim: boolean } | null>> {
  try {
    const hasil = await mintaVerifikasiKontakData(formData.get("target"));
    revalidatePath("/layanan-mandiri/profil");
    return successState(
      hasil.pesan,
      { terkirim: hasil.terkirim },
      hasil.terkirim ? undefined : "warning",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function verifikasiKontakAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  try {
    await verifikasiKontakWargaData(formData.get("kode"));
    revalidatePath("/layanan-mandiri/profil");
    return successState("Nomor HP berhasil diverifikasi.");
  } catch (error) {
    return toErrorState(error);
  }
}
