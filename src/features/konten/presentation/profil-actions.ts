"use server";

import { revalidatePath } from "next/cache";

import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

import { simpanProfil } from "../application/profil-use-cases";
import { profilDesaFormSchema } from "../domain/profil";

const PROFIL_PATH = "/konten/profil";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Simpan visi/misi/sejarah/sambutan/koordinat profil desa. */
export async function simpanProfilAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = profilDesaFormSchema.safeParse({
    visi: text(formData, "visi"),
    misi: text(formData, "misi"),
    sejarah: text(formData, "sejarah"),
    sambutan: text(formData, "sambutan"),
    koordinat: text(formData, "koordinat"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian profil desa.", zodToFieldErrors(parsed.error));
  }

  try {
    await simpanProfil(parsed.data);
    revalidatePath(PROFIL_PATH);
    revalidatePath("/desa/profil");
    revalidatePath("/");
    return successState("Profil desa disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}
