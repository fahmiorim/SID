"use server";

import { revalidatePath } from "next/cache";

import {
  createJenisSuratData,
  createKlasifikasiSuratData,
  deleteJenisSuratData,
  deleteKlasifikasiSuratData,
  updateJenisSuratData,
  updateKlasifikasiSuratData,
} from "@/features/surat/application/master-use-cases";
import { jenisSuratFormSchema, klasifikasiSuratFormSchema } from "@/features/surat/domain/surat";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const JENIS_PATH = "/persuratan/jenis";
const KLASIFIKASI_PATH = "/persuratan/klasifikasi";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function parseBoolean(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

export async function saveKlasifikasiAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = klasifikasiSuratFormSchema.safeParse({
    code: text(formData, "code"),
    name: text(formData, "name"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createKlasifikasiSuratData(parsed.data);
    } else {
      await updateKlasifikasiSuratData(id, parsed.data);
    }
    revalidatePath(KLASIFIKASI_PATH);
    revalidatePath(JENIS_PATH);
    return successState(id === null ? "Klasifikasi ditambahkan." : "Klasifikasi diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteKlasifikasiAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data klasifikasi tidak valid.");

  try {
    await deleteKlasifikasiSuratData(id);
    revalidatePath(KLASIFIKASI_PATH);
    revalidatePath(JENIS_PATH);
    return successState("Klasifikasi dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function saveJenisSuratAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = jenisSuratFormSchema.safeParse({
    code: text(formData, "code"),
    name: text(formData, "name"),
    classificationId: text(formData, "classificationId"),
    templateBody: text(formData, "templateBody"),
    requiresResident: parseBoolean(formData, "requiresResident"),
    isActive: parseBoolean(formData, "isActive"),
    numberFormat: text(formData, "numberFormat"),
    validityMonths: text(formData, "validityMonths"),
    sortOrder: text(formData, "sortOrder"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createJenisSuratData(parsed.data);
    } else {
      await updateJenisSuratData(id, parsed.data);
    }
    revalidatePath(JENIS_PATH);
    revalidatePath("/persuratan/surat");
    return successState(id === null ? "Jenis surat ditambahkan." : "Jenis surat diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteJenisSuratAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data jenis surat tidak valid.");

  try {
    await deleteJenisSuratData(id);
    revalidatePath(JENIS_PATH);
    return successState("Jenis surat dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
