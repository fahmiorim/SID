"use server";

import { revalidatePath } from "next/cache";

import {
  createRoleData,
  deleteRoleData,
  saveRolePermissions,
  updateRoleData,
} from "@/features/rbac/application/grup-use-cases";
import { roleFormSchema } from "@/features/rbac/domain/grup";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const GRUP_PATH = "/pengaturan/grup";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const v = Number(raw);
  return Number.isInteger(v) && v > 0 ? v : null;
}

export async function saveRoleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = roleFormSchema.safeParse({ name: text(formData, "name") });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createRoleData(parsed.data);
    } else {
      await updateRoleData(id, parsed.data);
    }
    revalidatePath(GRUP_PATH);
    return successState(id === null ? "Grup akses ditambahkan." : "Grup akses diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteRoleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data grup tidak valid.");

  try {
    await deleteRoleData(id);
    revalidatePath(GRUP_PATH);
    return successState("Grup akses dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function savePermissionsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const roleId = parseId(formData.get("roleId"));
  if (roleId === null) return errorState("Grup tidak valid.");

  const perms: Array<{ moduleId: number; read: boolean; write: boolean; manage: boolean }> = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("perm:")) continue;
    const parts = key.split(":");
    if (parts.length !== 4) continue;
    const moduleId = Number(parts[1]);
    if (!Number.isInteger(moduleId)) continue;
    const action = parts[2] as "read" | "write" | "manage";
    const checked = value === "on" || value === "true" || value === "1";
    let entry = perms.find((p) => p.moduleId === moduleId);
    if (!entry) {
      entry = { moduleId, read: false, write: false, manage: false };
      perms.push(entry);
    }
    entry[action] = checked;
  }

  try {
    await saveRolePermissions(roleId, perms);
    revalidatePath(GRUP_PATH);
    return successState("Hak akses disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}
