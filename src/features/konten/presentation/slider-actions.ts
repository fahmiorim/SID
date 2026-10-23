"use server";

import { revalidatePath } from "next/cache";

import { hapusSlider, simpanSlider } from "@/features/konten/application/slider-use-cases";
import { sliderFormSchema } from "@/features/konten/domain/slider";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

import { booleanValue, parseId, text } from "./form-utils";

const PATH = "/konten/slider";

export async function saveSliderAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sliderFormSchema.safeParse({
    gambar: text(formData, "gambar"),
    judul: text(formData, "judul"),
    keterangan: text(formData, "keterangan"),
    tautan: text(formData, "tautan"),
    urut: text(formData, "urut") || "0",
    aktif: booleanValue(formData, "aktif"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali data slider.", zodToFieldErrors(parsed.error));
  }

  try {
    const id = parseId(formData.get("id"));
    await simpanSlider(parsed.data, id);
    revalidatePath(PATH);
    revalidatePath("/");
    return successState(
      id === undefined ? "Slider berhasil ditambahkan." : "Slider berhasil diubah.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteSliderAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === undefined) return errorState("Slider yang akan dihapus tidak valid.");

  try {
    await hapusSlider(id);
    revalidatePath(PATH);
    revalidatePath("/");
    return successState("Slider berhasil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
