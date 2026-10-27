"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  createDtksUseCase,
  deleteDtksUseCase,
  getDtksDetailUseCase,
  updateDtksUseCase,
} from "@/features/penduduk/application/dtks-use-cases";
import { DTKS_RESOURCE, dtksCreateSchema, dtksUpdateSchema } from "@/features/penduduk/domain/dtks";
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

export async function getDtksDetailAction(id: number) {
  const user = await requirePermission(DTKS_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  try {
    const detail = await getDtksDetailUseCase(villageId, id);
    if (!detail) return { ok: false as const, message: "Data DTKS tidak ditemukan." };
    return { ok: true as const, ...detail };
  } catch (e) {
    return { ok: false as const, message: e instanceof Error ? e.message : "Gagal memuat data." };
  }
}

export async function updateDtksAction(formData: FormData) {
  const user = await requirePermission(DTKS_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false as const, message: "Data DTKS tidak valid." };
  }

  const raw = {
    status: formData.get("status"),
    tanggalPencacahan: formData.get("tanggalPencacahan") || null,
    tanggalPemeriksaan: formData.get("tanggalPemeriksaan") || null,
    namaPetugasPencacahan: formData.get("namaPetugasPencacahan") || null,
    namaResponden: formData.get("namaResponden") || null,
    keterangan: formData.get("keterangan") || null,
  };

  const parsed = dtksUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await updateDtksUseCase(villageId, id, parsed.data);
    revalidatePath("/penduduk/dtks");
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Gagal menyimpan DTKS.",
    };
  }
}
