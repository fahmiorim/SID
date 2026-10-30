"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  daftarKehadiran,
  hapusKehadiran,
  tambahKehadiran,
  ubahKehadiran,
} from "../application/kehadiran-use-cases";

export async function listKehadiranAction(opts?: {
  bulan?: number;
  tahun?: number;
  perangkatId?: number;
}) {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarKehadiran(user.villageId, opts);
}

export async function createKehadiranAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      perangkatId: formData.get("perangkatId"),
      tanggal: formData.get("tanggal"),
      jamMasuk: formData.get("jamMasuk"),
      jamKeluar: formData.get("jamKeluar"),
      status: formData.get("status"),
    };
    const result = await tambahKehadiran(user.villageId, input);
    revalidatePath("/kehadiran");
    return successState("Kehadiran berhasil ditambahkan.", { id: result });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambah kehadiran.");
  }
}

export async function updateKehadiranAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    const input = {
      perangkatId: formData.get("perangkatId"),
      tanggal: formData.get("tanggal"),
      jamMasuk: formData.get("jamMasuk"),
      jamKeluar: formData.get("jamKeluar"),
      status: formData.get("status"),
    };
    await ubahKehadiran(user.villageId, id, input);
    revalidatePath("/kehadiran");
    return successState("Kehadiran berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui kehadiran.");
  }
}

export async function deleteKehadiranAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    await hapusKehadiran(user.villageId, id);
    revalidatePath("/kehadiran");
    return successState("Kehadiran berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus kehadiran.");
  }
}
