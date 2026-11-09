"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  daftarAnjungan,
  hapusAnjungan,
  tambahAnjungan,
  ubahAnjungan,
} from "../application/anjungan-use-cases";

export async function listAnjunganAction(aktifOnly = false) {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarAnjungan(user.villageId, aktifOnly);
}

export async function createAnjunganAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      nama: formData.get("nama"),
      deskripsi: formData.get("deskripsi"),
      aktif: formData.get("aktif"),
      urutan: formData.get("urutan"),
      uuid: formData.get("uuid"),
      ipAddress: formData.get("ipAddress"),
      macAddress: formData.get("macAddress"),
      ipAddressPortPrinter: formData.get("ipAddressPortPrinter"),
      keyboard: formData.get("keyboard"),
      orientasiLayar: formData.get("orientasiLayar"),
      permohonanSuratTanpaAkun: formData.get("permohonanSuratTanpaAkun"),
      status: formData.get("status"),
    };
    const result = await tambahAnjungan(user.villageId, input);
    revalidatePath("/anjungan");
    return successState("Anjungan berhasil ditambahkan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambah anjungan.");
  }
}

export async function updateAnjunganAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    const input = {
      nama: formData.get("nama"),
      deskripsi: formData.get("deskripsi"),
      aktif: formData.get("aktif"),
      urutan: formData.get("urutan"),
      uuid: formData.get("uuid"),
      ipAddress: formData.get("ipAddress"),
      macAddress: formData.get("macAddress"),
      ipAddressPortPrinter: formData.get("ipAddressPortPrinter"),
      keyboard: formData.get("keyboard"),
      orientasiLayar: formData.get("orientasiLayar"),
      permohonanSuratTanpaAkun: formData.get("permohonanSuratTanpaAkun"),
      status: formData.get("status"),
    };
    await ubahAnjungan(user.villageId, id, input);
    revalidatePath("/anjungan");
    return successState("Anjungan berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui anjungan.");
  }
}

export async function deleteAnjunganAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    await hapusAnjungan(user.villageId, id);
    // Baris dihapus oleh tombol setelah toast tampil (lihat HapusAnjunganButton).
    // Revalidasi di sini akan melepas komponen sebelum efek toast sempat berjalan.
    return successState("Anjungan berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus anjungan.");
  }
}
