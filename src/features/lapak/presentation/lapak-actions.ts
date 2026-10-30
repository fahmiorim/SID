"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  daftarKategoriLapak,
  daftarLapak,
  hapusLapak,
  tambahLapak,
  ubahLapak,
} from "../application/lapak-use-cases";

export async function listLapakAction(opts?: { kategori?: string; q?: string }) {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarLapak(user.villageId, opts);
}

export async function listKategoriLapakAction() {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarKategoriLapak(user.villageId);
}

export async function createLapakAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      nama: formData.get("nama"),
      pemilik: formData.get("pemilik"),
      kategori: formData.get("kategori"),
      alamat: formData.get("alamat"),
      keterangan: formData.get("keterangan"),
    };
    const result = await tambahLapak(user.villageId, input);
    revalidatePath("/lapak");
    return successState("Lapak berhasil ditambahkan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambah lapak.");
  }
}

export async function updateLapakAction(
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
      pemilik: formData.get("pemilik"),
      kategori: formData.get("kategori"),
      alamat: formData.get("alamat"),
      keterangan: formData.get("keterangan"),
    };
    await ubahLapak(user.villageId, id, input);
    revalidatePath("/lapak");
    return successState("Lapak berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui lapak.");
  }
}

export async function deleteLapakAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    await hapusLapak(user.villageId, id);
    revalidatePath("/lapak");
    return successState("Lapak berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus lapak.");
  }
}
