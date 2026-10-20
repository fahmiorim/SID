"use server";

import { revalidatePath } from "next/cache";

import {
  createModulData,
  deleteModulData,
  updateModulData,
} from "@/features/modul/application/modul-use-cases";
import { modulFormSchema } from "@/features/modul/domain/modul";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

const MODUL_PATH = "/pengaturan/modul";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const v = Number(raw);
  return Number.isInteger(v) && v > 0 ? v : null;
}

function parseBoolean(formData: FormData, name: string): boolean {
  const v = formData.get(name);
  if (v === "on" || v === "true" || v === "1") return true;
  return false;
}

export async function saveModulAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = modulFormSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    parentId: text(formData, "parentId") || NO_SELECTION,
    url: text(formData, "url"),
    icon: text(formData, "icon"),
    isGroup: parseBoolean(formData, "isGroup"),
    isActive: parseBoolean(formData, "isActive"),
    sortOrder: text(formData, "sortOrder"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createModulData(parsed.data);
    } else {
      await updateModulData(id, parsed.data);
    }
    revalidatePath(MODUL_PATH);
    return successState(id === null ? "Modul ditambahkan." : "Modul diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteModulAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data modul tidak valid.");

  try {
    await deleteModulData(id);
    revalidatePath(MODUL_PATH);
    return successState("Modul dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
