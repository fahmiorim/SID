"use server";

import { revalidatePath } from "next/cache";

import {
  assignAnggotaRumahTangga,
  createRumahTangga,
  deleteRumahTangga,
  listRumahTanggaMembers,
  removeAnggotaRumahTangga,
  updateRumahTangga,
} from "@/features/rumah-tangga/application/use-cases";
import {
  rumahTanggaFormSchema,
  type RumahTanggaMember,
} from "@/features/rumah-tangga/domain/rumah-tangga";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const RUMAH_TANGGA_PATH = "/rumah-tangga";

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
 * Simpan rumah tangga (tambah bila `id` kosong, ubah bila ada).
 *
 * Nomor RTM tidak diambil dari formulir — dibangkitkan use case. Izin & validasi
 * ditegakkan di server (use case + Zod); UI hanya menyajikan.
 */
export async function saveRumahTanggaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = rumahTanggaFormSchema.safeParse({
    alamat: text(formData, "alamat"),
    regionId: text(formData, "regionId"),
    kelasSosial: text(formData, "kelasSosial"),
    bdt: text(formData, "bdt"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createRumahTangga(parsed.data);
    } else {
      await updateRumahTangga(id, parsed.data);
    }

    revalidatePath(RUMAH_TANGGA_PATH);
    return successState(id === null ? "Rumah Tangga ditambahkan." : "Rumah Tangga diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus rumah tangga berdasarkan `id`. */
export async function deleteRumahTanggaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data rumah tangga tidak valid.");
  }

  try {
    await deleteRumahTangga(id);
    revalidatePath(RUMAH_TANGGA_PATH);
    return successState("Rumah Tangga dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Daftar anggota RTM untuk dialog rincian; mengembalikan pesan bila gagal. */
export type RumahTanggaMembersResult =
  { ok: true; members: RumahTanggaMember[] } | { ok: false; message: string };

export async function loadRumahTanggaMembersAction(
  rtmId: number,
): Promise<RumahTanggaMembersResult> {
  if (!Number.isInteger(rtmId) || rtmId <= 0) {
    return { ok: false, message: "Data rumah tangga tidak valid." };
  }

  try {
    return { ok: true, members: await listRumahTanggaMembers(rtmId) };
  } catch (error) {
    const state = toErrorState(error);
    return { ok: false, message: state.status === "error" ? state.message : "Gagal memuat data." };
  }
}

/**
 * Tautkan seorang penduduk ke rumah tangga.
 *
 * Karena keanggotaan RTM eksklusif, penetapan ini memindahkan penduduk dari RTM
 * lamanya (bila ada).
 */
export async function assignAnggotaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rtmId = parseId(formData.get("rtmId"));
  const residentId = parseId(formData.get("residentId"));
  const level = Number(text(formData, "level"));

  if (rtmId === null || residentId === null) {
    return errorState("Data anggota tidak valid.");
  }
  if (!Number.isInteger(level) || level < 1 || level > 2) {
    return errorState("Periksa kembali isian Anda.", {
      level: ["Tingkat hubungan tidak valid."],
    });
  }

  try {
    await assignAnggotaRumahTangga(rtmId, residentId, level);
    revalidatePath(RUMAH_TANGGA_PATH);
    return successState("Anggota rumah tangga disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Lepaskan seorang penduduk dari rumah tangganya. */
export async function removeAnggotaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const residentId = parseId(formData.get("residentId"));

  if (residentId === null) {
    return errorState("Data anggota tidak valid.");
  }

  try {
    await removeAnggotaRumahTangga(residentId);
    revalidatePath(RUMAH_TANGGA_PATH);
    return successState("Anggota dikeluarkan dari rumah tangga.");
  } catch (error) {
    return toErrorState(error);
  }
}
