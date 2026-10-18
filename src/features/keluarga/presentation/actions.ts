"use server";

import { revalidatePath } from "next/cache";

import {
  createKeluarga,
  deleteKeluarga,
  listKeluargaMembers,
  updateKeluarga,
} from "@/features/keluarga/application/use-cases";
import { keluargaFormSchema, type KeluargaMember } from "@/features/keluarga/domain/keluarga";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const KELUARGA_PATH = "/keluarga";

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Ambil nilai teks dari FormData (string kosong bila tidak ada). */
function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Simpan keluarga (tambah bila `id` kosong, ubah bila ada).
 *
 * Izin & validasi ditegakkan di server (use case + Zod); UI hanya menyajikan.
 */
export async function saveKeluargaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = keluargaFormSchema.safeParse({
    number: text(formData, "number"),
    address: text(formData, "address"),
    regionId: text(formData, "regionId"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createKeluarga(parsed.data);
    } else {
      await updateKeluarga(id, parsed.data);
    }

    revalidatePath(KELUARGA_PATH);
    return successState(id === null ? "Kartu Keluarga ditambahkan." : "Kartu Keluarga diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus keluarga berdasarkan `id`. */
export async function deleteKeluargaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data keluarga tidak valid.");
  }

  try {
    await deleteKeluarga(id);
    revalidatePath(KELUARGA_PATH);
    return successState("Kartu Keluarga dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Daftar anggota KK untuk dialog rincian; mengembalikan pesan bila gagal. */
export type KeluargaMembersResult =
  { ok: true; members: KeluargaMember[] } | { ok: false; message: string };

export async function loadKeluargaMembersAction(familyId: number): Promise<KeluargaMembersResult> {
  if (!Number.isInteger(familyId) || familyId <= 0) {
    return { ok: false, message: "Data keluarga tidak valid." };
  }

  try {
    return { ok: true, members: await listKeluargaMembers(familyId) };
  } catch (error) {
    const state = toErrorState(error);
    return { ok: false, message: state.status === "error" ? state.message : "Gagal memuat data." };
  }
}
