"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  createDtksUseCase,
  deleteDtksUseCase,
} from "@/features/penduduk/application/dtks-use-cases";
import { DTKS_RESOURCE, dtksCreateSchema } from "@/features/penduduk/domain/dtks";
import { requirePermission } from "@/lib/dal";

export type CreateDtksActionState =
  | { success: true; id: number }
  | {
      error: {
        rtmId?: string[];
        versiKuisioner?: string[];
        keluargaId?: string[];
        _form?: string[];
      };
    };

export async function createDtksAction(formData: FormData): Promise<CreateDtksActionState> {
  const user = await requirePermission(DTKS_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const rawData = {
    rtmId: formData.get("rtmId"),
    versiKuisioner: formData.get("versiKuisioner") || "regsos_ek2022_k",
  };

  const validated = dtksCreateSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    const id = await createDtksUseCase(villageId, validated.data);
    revalidatePath("/penduduk/dtks");
    return { success: true, id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan internal.";
    return { error: { _form: [message] } };
  }
}

export type DeleteDtksActionState = { success: true } | { error: string };

export async function deleteDtksAction(id: number): Promise<DeleteDtksActionState> {
  const user = await requirePermission(DTKS_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  try {
    await deleteDtksUseCase(villageId, id);
    revalidatePath("/penduduk/dtks");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan internal.";
    return { error: message };
  }
}
