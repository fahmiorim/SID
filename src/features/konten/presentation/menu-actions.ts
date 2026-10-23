"use server";

import { revalidatePath } from "next/cache";

import { deleteMenu, saveMenu } from "@/features/konten/application/menu-use-cases";
import { menuPublikFormSchema } from "@/features/konten/domain/menu";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

import { booleanValue, parseId, text } from "./form-utils";

const PATH = "/konten/menu";

export async function saveMenuAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parentRaw = text(formData, "parentId");
  const parsed = menuPublikFormSchema.safeParse({
    nama: text(formData, "nama"),
    link: text(formData, "link"),
    linkTipe: text(formData, "linkTipe") || "internal",
    parentId: parentRaw === "" || parentRaw === "none" ? null : Number(parentRaw),
    urut: text(formData, "urut") || "0",
    aktif: booleanValue(formData, "aktif"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali data menu.", zodToFieldErrors(parsed.error));
  }

  try {
    const id = parseId(formData.get("id"));
    await saveMenu(parsed.data, id);
    revalidatePath(PATH);
    revalidatePath("/");
    return successState(id === undefined ? "Menu berhasil ditambahkan." : "Menu berhasil diubah.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteMenuAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === undefined) return errorState("Menu yang akan dihapus tidak valid.");

  try {
    await deleteMenu(id);
    revalidatePath(PATH);
    revalidatePath("/");
    return successState("Menu berhasil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
