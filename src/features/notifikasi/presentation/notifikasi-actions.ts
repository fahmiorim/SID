"use server";

import { revalidatePath } from "next/cache";

import { successState, toErrorState, type ActionState } from "@/lib/action-state";

import { kirimNotifikasiManual } from "../application/notifikasi-use-cases";

export async function kirimNotifikasiManualAction(
  _prev: ActionState<{ sukses: boolean; dilewati: boolean } | null>,
  formData: FormData,
): Promise<ActionState<{ sukses: boolean; dilewati: boolean } | null>> {
  try {
    const hasil = await kirimNotifikasiManual({
      kanal: formData.get("kanal"),
      target: formData.get("target"),
      subjek: formData.get("subjek") ?? undefined,
      pesan: formData.get("pesan"),
    });

    revalidatePath("/pengaturan/notifikasi");

    if (hasil.dilewati) {
      return successState(
        "Percobaan pengiriman dicatat, tetapi provider belum dikonfigurasi sehingga pesan dilewati.",
        { sukses: hasil.sukses, dilewati: hasil.dilewati },
        "warning",
      );
    }

    if (!hasil.sukses) {
      return successState(
        hasil.error ?? "Pengiriman gagal; percobaan sudah dicatat.",
        { sukses: hasil.sukses, dilewati: hasil.dilewati },
        "warning",
      );
    }

    return successState("Notifikasi berhasil dikirim.", {
      sukses: hasil.sukses,
      dilewati: hasil.dilewati,
    });
  } catch (error) {
    return toErrorState(error);
  }
}
