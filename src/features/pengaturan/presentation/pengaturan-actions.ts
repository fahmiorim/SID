"use server";

import { revalidatePath } from "next/cache";

import { successState, toErrorState, type ActionState } from "@/lib/action-state";

import { simpanPengaturanAdmin } from "../application/pengaturan-use-cases";
import { checkboxAktif, PENGATURAN_DEFAULT } from "../domain/pengaturan";

/** Simpan pengaturan aplikasi (OS-OPS-003). */
export async function simpanPengaturanAplikasiAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  try {
    const angka = (nama: string, bawaan: number) => {
      const nilai = Number(formData.get(nama));
      return Number.isFinite(nilai) ? nilai : bawaan;
    };

    await simpanPengaturanAdmin({
      komentarAktif: checkboxAktif(formData.get("komentarAktif")),
      beritaBeranda: angka("beritaBeranda", PENGATURAN_DEFAULT.beritaBeranda),
      pendaftaranWargaAktif: checkboxAktif(formData.get("pendaftaranWargaAktif")),
    });

    revalidatePath("/pengaturan/aplikasi");
    revalidatePath("/desa/registrasi-warga");
    revalidatePath("/desa/kontak");
    return successState("Pengaturan aplikasi disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}
