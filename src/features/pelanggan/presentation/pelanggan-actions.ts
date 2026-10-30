"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  daftarPelanggan,
  hapusPelanggan,
  tambahPelanggan,
  ubahPelanggan,
} from "../application/pelanggan-use-cases";

export async function listPelangganAction(opts?: { q?: string }) {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarPelanggan(user.villageId, opts);
}

export async function createPelangganAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      nama: formData.get("nama"),
      kontak: formData.get("kontak"),
      alamat: formData.get("alamat"),
      keterangan: formData.get("keterangan"),
    };
    const result = await tambahPelanggan(user.villageId, input);
    revalidatePath("/pelanggan");
    return successState("Pelanggan berhasil ditambahkan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambah pelanggan.");
  }
}

export async function updatePelangganAction(
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
      kontak: formData.get("kontak"),
      alamat: formData.get("alamat"),
      keterangan: formData.get("keterangan"),
    };
    await ubahPelanggan(user.villageId, id, input);
    revalidatePath("/pelanggan");
    return successState("Pelanggan berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui pelanggan.");
  }
}

export async function deletePelangganAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    await hapusPelanggan(user.villageId, id);
    revalidatePath("/pelanggan");
    return successState("Pelanggan berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus pelanggan.");
  }
}
