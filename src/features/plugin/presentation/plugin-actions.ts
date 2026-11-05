"use server";

import { revalidatePath } from "next/cache";

import { successState, toErrorState, type ActionState } from "@/lib/action-state";

import { ubahStatusPlugin } from "../application/plugin-use-cases";

export async function ubahStatusPluginAction(
  _prev: ActionState<string | null>,
  formData: FormData,
): Promise<ActionState<string | null>> {
  try {
    const slug = String(formData.get("slug") ?? "");
    const aktif = String(formData.get("aktif") ?? "") === "true";

    await ubahStatusPlugin(slug, aktif);
    revalidatePath("/pengaturan/plugin");

    return successState(aktif ? "Plugin diaktifkan." : "Plugin dinonaktifkan.", slug);
  } catch (error) {
    return toErrorState(error);
  }
}
