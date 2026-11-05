"use server";

import { revalidatePath } from "next/cache";

import { successState, toErrorState, type ActionState } from "@/lib/action-state";

import { balasEmailMasuk, balasSmsMasuk } from "../application/mailbox-sms-use-cases";

export async function balasEmailAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  try {
    const hasil = await balasEmailMasuk({
      id: Number(formData.get("id")),
      isi: String(formData.get("isi") ?? ""),
    });

    revalidatePath("/pengaturan/notifikasi");

    if (hasil.dilewati) {
      return successState(
        "Balasan dicatat, tetapi email dilewati karena provider belum dikonfigurasi.",
        null,
        "warning",
      );
    }
    if (!hasil.sukses) {
      return successState(
        hasil.error ?? "Balasan gagal dikirim; salinan tetap dicatat.",
        null,
        "warning",
      );
    }

    return successState("Balasan email terkirim.", null);
  } catch (error) {
    return toErrorState(error);
  }
}

export async function balasSmsAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  try {
    const hasil = await balasSmsMasuk({
      nomor: String(formData.get("nomor") ?? ""),
      isi: String(formData.get("isi") ?? ""),
    });

    revalidatePath("/pengaturan/notifikasi");

    if (hasil.dilewati) {
      return successState(
        "Balasan dicatat, tetapi SMS dilewati karena gateway belum dikonfigurasi.",
        null,
        "warning",
      );
    }
    if (!hasil.sukses) {
      return successState(
        hasil.error ?? "Balasan SMS gagal dikirim; salinan tetap dicatat.",
        null,
        "warning",
      );
    }

    return successState("Balasan SMS terkirim.", null);
  } catch (error) {
    return toErrorState(error);
  }
}
