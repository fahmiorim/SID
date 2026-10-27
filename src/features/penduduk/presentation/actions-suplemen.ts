"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  addSuplemenTerdataUseCase,
  createSuplemenUseCase,
  deleteSuplemenUseCase,
  getSuplemenTerdataUseCase,
  removeSuplemenTerdataUseCase,
  updateSuplemenUseCase,
} from "@/features/penduduk/application/suplemen-use-cases";
import {
  SUPLEMEN_RESOURCE,
  suplemenCreateSchema,
  suplemenTerdataSchema,
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

export async function listSuplemenTerdataAction(suplemenId: number) {
  const user = await requirePermission(SUPLEMEN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  try {
    return { ok: true as const, rows: await getSuplemenTerdataUseCase(villageId, suplemenId) };
  } catch (e) {
    return { ok: false as const, message: e instanceof Error ? e.message : "Gagal memuat data." };
  }
}

export async function addSuplemenTerdataAction(formData: FormData) {
  const user = await requirePermission(SUPLEMEN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const parsed = suplemenTerdataSchema.safeParse({
    suplemenId: formData.get("suplemenId"),
    pendudukId: formData.get("pendudukId") || null,
    keluargaId: formData.get("keluargaId") || null,
  });

  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await addSuplemenTerdataUseCase(villageId, parsed.data);
    revalidatePath("/penduduk/suplemen");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: e instanceof Error ? e.message : "Gagal menyimpan." };
  }
}

export async function removeSuplemenTerdataAction(id: number) {
  const user = await requirePermission(SUPLEMEN_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  try {
    await removeSuplemenTerdataUseCase(villageId, id);
    revalidatePath("/penduduk/suplemen");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}
