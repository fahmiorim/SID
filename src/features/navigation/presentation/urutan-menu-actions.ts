"use server";

import { revalidatePath } from "next/cache";

import { successState, toErrorState, type ActionState } from "@/lib/action-state";

import { simpanUrutanMenuSidebar } from "../application/urutan-menu-use-cases";

/** Simpan urutan menu sidebar pengguna (OS-OPS-002). */
export async function simpanUrutanMenuAction(
  _prev: ActionState<number>,
  formData: FormData,
): Promise<ActionState<number>> {
  try {
    const reset = formData.get("aksi") === "reset";
    const slugs = reset ? [] : formData.getAll("slug").map((nilai) => String(nilai));
    const tersimpan = await simpanUrutanMenuSidebar(slugs);

    revalidatePath("/", "layout");

    return successState(
      reset ? "Urutan menu dikembalikan ke bawaan." : "Urutan menu sidebar disimpan.",
      tersimpan.length,
    );
  } catch (error) {
    return toErrorState(error);
  }
}
