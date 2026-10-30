"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { AppError, isAppError } from "@/lib/errors";

import {
  daftarSisaLebih,
  hapusSisaLebih,
  tambahSisaLebih,
  ubahSisaLebih,
} from "../application/sisa-lebih-use-cases";

export async function listSisaLebihAction() {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new AppError("FORBIDDEN", "Desa tidak ditemukan.");
  return daftarSisaLebih(user.villageId);
}

export async function createSisaLebihAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      tahun: formData.get("tahun"),
      jumlah: formData.get("jumlah"),
      keterangan: formData.get("keterangan"),
      tanggal: formData.get("tanggal"),
    };
    const result = await tambahSisaLebih(user.villageId, input);
    revalidatePath("/keuangan/sisa-lebih");
    return successState("Data SiLPA berhasil ditambahkan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambah data SiLPA.");
  }
}

export async function updateSisaLebihAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    const input = {
      tahun: formData.get("tahun"),
      jumlah: formData.get("jumlah"),
      keterangan: formData.get("keterangan"),
      tanggal: formData.get("tanggal"),
    };
    await ubahSisaLebih(user.villageId, id, input);
    revalidatePath("/keuangan/sisa-lebih");
    return successState("Data SiLPA berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui data SiLPA.");
  }
}

export async function deleteSisaLebihAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    await hapusSisaLebih(user.villageId, id);
    revalidatePath("/keuangan/sisa-lebih");
    return successState("Data SiLPA berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus data SiLPA.");
  }
}
