"use server";

import { revalidatePath } from "next/cache";

import {
  createSuratDraftData,
  deleteSuratData,
  issueSuratData,
  updateSuratDraftData,
} from "@/features/surat/application/surat-use-cases";
import { suratFormSchema } from "@/features/surat/domain/surat";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const SURAT_PATH = "/persuratan/surat";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function saveSuratAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = suratFormSchema.safeParse({
    typeId: text(formData, "typeId"),
    residentId: text(formData, "residentId"),
    letterDate: text(formData, "letterDate"),
    purpose: text(formData, "purpose"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createSuratDraftData(parsed.data);
    } else {
      await updateSuratDraftData(id, parsed.data);
    }
    revalidatePath(SURAT_PATH);
    return successState(id === null ? "Konsep surat disimpan." : "Konsep surat diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function issueSuratAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data surat tidak valid.");

  try {
    const { number } = await issueSuratData(id);
    revalidatePath(SURAT_PATH);
    revalidatePath(`/persuratan/surat/${id}/cetak`);
    return successState(`Surat diterbitkan dengan nomor ${number}.`);
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteSuratAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data surat tidak valid.");

  try {
    await deleteSuratData(id);
    revalidatePath(SURAT_PATH);
    return successState("Konsep surat dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
