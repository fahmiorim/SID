"use server";

import { revalidatePath } from "next/cache";

import {
  ajukanVerifikasiSuratData,
  createSuratDraftData,
  deleteSuratData,
  rejectSuratData,
  updateSuratDraftData,
  verifySuratData,
} from "@/features/surat/application/surat-use-cases";
import { ISIAN_FIELD_PREFIX } from "@/features/surat/domain/isian";
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

/**
 * Kumpulkan nilai isian dinamis dari formulir.
 *
 * Field isian dikirim dengan nama `isian.<kode>`; hanya kode yang dikirim
 *-server yang diteruskan ke use case (use case tetap memfilter terhadap
 * definisi isian jenis surat).
 */
function collectIsian(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith(ISIAN_FIELD_PREFIX)) continue;
    if (typeof value !== "string") continue;
    values[key.slice(ISIAN_FIELD_PREFIX.length)] = value;
  }

  return values;
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
    isiSurat: collectIsian(formData),
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

export async function ajukanVerifikasiSuratAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data surat tidak valid.");

  // Checkbox syarat hanya ada pada dialog ajukan untuk jenis surat bersyarat.
  const konfirmasiSyarat = formData.get("syaratDiperiksa") === "1";

  try {
    await ajukanVerifikasiSuratData(id, konfirmasiSyarat);
    revalidatePath(SURAT_PATH);
    return successState("Surat diajukan untuk verifikasi.");
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

export async function verifySuratAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const action = text(formData, "action") as "operator" | "sekdes" | "kades";
  if (id === null) return errorState("Data surat tidak valid.");
  if (!["operator", "sekdes", "kades"].includes(action)) {
    return errorState("Aksi verifikasi tidak valid.");
  }

  try {
    const { number } = await verifySuratData(id, action);
    revalidatePath(SURAT_PATH);
    revalidatePath(`/persuratan/surat/${id}`);
    return successState(
      number ? `Surat terverifikasi dan terbit dengan nomor ${number}.` : "Surat diverifikasi.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function rejectSuratAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const reason = text(formData, "reason");
  if (id === null) return errorState("Data surat tidak valid.");

  try {
    await rejectSuratData(id, reason);
    revalidatePath(SURAT_PATH);
    revalidatePath(`/persuratan/surat/${id}`);
    return successState("Surat ditolak.");
  } catch (error) {
    return toErrorState(error);
  }
}
