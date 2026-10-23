"use server";

import { revalidatePath } from "next/cache";

import { hapusWidget, simpanWidget } from "@/features/konten/application/widget-use-cases";
import { widgetFormSchema } from "@/features/konten/domain/widget";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

import { booleanValue, parseId, text } from "./form-utils";

const PATH = "/konten/widget";

export async function saveWidgetAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = widgetFormSchema.safeParse({
    judul: text(formData, "judul"),
    isi: text(formData, "isi"),
    jenis: text(formData, "jenis") || "1",
    pengaturan: text(formData, "pengaturan"),
    urut: text(formData, "urut") || "0",
    aktif: booleanValue(formData, "aktif"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali data widget.", zodToFieldErrors(parsed.error));
  }

  try {
    const id = parseId(formData.get("id"));
    await simpanWidget(parsed.data, id);
    revalidatePath(PATH);
    revalidatePath("/");
    return successState(
      id === undefined ? "Widget berhasil ditambahkan." : "Widget berhasil diubah.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteWidgetAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === undefined) return errorState("Widget yang akan dihapus tidak valid.");

  try {
    await hapusWidget(id);
    revalidatePath(PATH);
    revalidatePath("/");
    return successState("Widget berhasil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
