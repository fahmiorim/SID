"use server";

import { revalidatePath } from "next/cache";

import {
  createPenggunaData,
  deletePenggunaData,
  updatePenggunaData,
} from "@/features/pengguna/application/pengguna-use-cases";
import { penggunaCreateSchema, penggunaUpdateSchema } from "@/features/pengguna/domain/pengguna";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PENGGUNA_PATH = "/pengaturan/pengguna";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseBoolean(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

export async function savePenggunaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawId = text(formData, "id").trim();
  const id = rawId === "" ? null : rawId;

  const raw = {
    name: text(formData, "name"),
    username: text(formData, "username"),
    email: text(formData, "email"),
    roleId: text(formData, "roleId"),
    active: parseBoolean(formData, "active"),
    password: text(formData, "password"),
  };

  try {
    if (id === null) {
      const parsed = penggunaCreateSchema.safeParse(raw);
      if (!parsed.success) {
        return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
      }

      await createPenggunaData(parsed.data);
      revalidatePath(PENGGUNA_PATH);
      return successState("Pengguna ditambahkan.");
    }

    const parsed = penggunaUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
    }

    await updatePenggunaData(id, parsed.data);
    revalidatePath(PENGGUNA_PATH);
    return successState("Pengguna diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deletePenggunaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = text(formData, "id").trim();
  if (id === "") return errorState("Data pengguna tidak valid.");

  try {
    await deletePenggunaData(id);
    revalidatePath(PENGGUNA_PATH);
    return successState("Pengguna dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
