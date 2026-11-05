"use server";

import { revalidatePath } from "next/cache";

import { successState, toErrorState, type ActionState } from "@/lib/action-state";

import { simpanShortcutBeranda } from "../application/shortcut-use-cases";

/** Simpan pintasan beranda pengguna (OS-OPS-002). */
export async function simpanShortcutAction(
  _prev: ActionState<number>,
  formData: FormData,
): Promise<ActionState<number>> {
  try {
    const hrefs = formData.getAll("href").map((nilai) => String(nilai));
    const tersimpan = await simpanShortcutBeranda(hrefs);

    revalidatePath("/beranda");
    return successState(
      tersimpan.length > 0 ? "Shortcut beranda disimpan." : "Shortcut dikembalikan ke bawaan.",
      tersimpan.length,
    );
  } catch (error) {
    return toErrorState(error);
  }
}
