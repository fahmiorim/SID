"use server";

import { revalidatePath } from "next/cache";

import {
  buatKonsepSuratPermohonanData,
  getPermohonanAdminData,
  kembalikanPermohonanAdminData,
  ubahStatusPermohonanData,
} from "@/features/layanan-mandiri/application/admin-use-cases";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

const PATH = "/permohonan-surat";

/** Data halaman operator permohonan surat. */
export async function getLayananMandiriData() {
  const permohonan = await getPermohonanAdminData();
  return { permohonan };
}

export async function buatKonsepSuratPermohonanAction(
  _previousState: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return errorState("Permohonan tidak valid.");

  try {
    const surat = await buatKonsepSuratPermohonanData(id);
    revalidatePath(PATH);
    revalidatePath("/persuratan/surat");
    revalidatePath("/layanan-mandiri/beranda");
    revalidatePath("/layanan-mandiri/surat");
    return successState(`Konsep surat #${surat.id} dibuat dan diajukan ke verifikasi.`, surat);
  } catch (error) {
    return toErrorState(error);
  }
}

export async function prosesPermohonanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id"));
  const status = Number(formData.get("status"));
  const alasan = String(formData.get("alasan") ?? "");

  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(status)) {
    return errorState("Data tidak valid.");
  }

  try {
    await ubahStatusPermohonanData(id, status, alasan);
    revalidatePath(PATH);
    revalidatePath("/layanan-mandiri/beranda");
    revalidatePath("/layanan-mandiri/surat");
    revalidatePath("/layanan-mandiri/dokumen");
    revalidatePath("/layanan-mandiri/pesan");
    return successState("Status permohonan diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function kembalikanPermohonanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id"));
  const alasan = String(formData.get("alasan") ?? "");

  if (!Number.isInteger(id) || id < 1) return errorState("Data tidak valid.");
  if (!alasan.trim()) return errorState("Alasan wajib diisi.");

  try {
    await kembalikanPermohonanAdminData(id, alasan);
    revalidatePath(PATH);
    revalidatePath("/layanan-mandiri/beranda");
    revalidatePath("/layanan-mandiri/surat");
    revalidatePath("/layanan-mandiri/pesan");
    return successState("Permohonan dikembalikan dengan catatan.");
  } catch (error) {
    return toErrorState(error);
  }
}
