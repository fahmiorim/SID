"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  createSuplemenUseCase,
  deleteSuplemenUseCase,
  updateSuplemenUseCase,
} from "@/features/penduduk/application/suplemen-use-cases";
import {
  SUPLEMEN_RESOURCE,
  suplemenCreateSchema,
  suplemenUpdateSchema,
} from "@/features/penduduk/domain/suplemen";
import { requirePermission } from "@/lib/dal";

export type CreateSuplemenActionState =
  | { success: true }
  | { error: { nama?: string[]; sasaran?: string[]; keterangan?: string[]; _form?: string[] } };

export async function createSuplemenAction(formData: FormData): Promise<CreateSuplemenActionState> {
  const user = await requirePermission(SUPLEMEN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const rawData = {
    nama: formData.get("nama"),
    sasaran: formData.get("sasaran"),
    keterangan: formData.get("keterangan"),
  };

  const validated = suplemenCreateSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await createSuplemenUseCase(villageId, validated.data);
    revalidatePath("/penduduk/suplemen");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan internal.";
    return { error: { _form: [message] } };
  }
}

export type UpdateSuplemenActionState =
  | { success: true }
  | {
      error: {
        id?: string[];
        nama?: string[];
        sasaran?: string[];
        keterangan?: string[];
        _form?: string[];
      };
    };

export async function updateSuplemenAction(formData: FormData): Promise<UpdateSuplemenActionState> {
  const user = await requirePermission(SUPLEMEN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const rawData = {
    id: formData.get("id"),
    nama: formData.get("nama"),
    sasaran: formData.get("sasaran"),
    keterangan: formData.get("keterangan"),
  };

  const validated = suplemenUpdateSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await updateSuplemenUseCase(villageId, validated.data);
    revalidatePath("/penduduk/suplemen");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan internal.";
    return { error: { _form: [message] } };
  }
}

export type DeleteSuplemenActionState = { success: true } | { error: string };

export async function deleteSuplemenAction(id: number): Promise<DeleteSuplemenActionState> {
  const user = await requirePermission(SUPLEMEN_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  try {
    await deleteSuplemenUseCase(villageId, id);
    revalidatePath("/penduduk/suplemen");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan internal.";
    return { error: message };
  }
}
