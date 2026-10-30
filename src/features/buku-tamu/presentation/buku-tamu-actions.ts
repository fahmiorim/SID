"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  daftarBukuTamu,
  hapusBukuTamu,
  tambahBukuTamu,
  ubahBukuTamu,
} from "../application/buku-tamu-use-cases";

export async function listBukuTamuAction() {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarBukuTamu(user.villageId);
}

export async function createBukuTamuAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      nama: formData.get("nama"),
      instansi: formData.get("instansi"),
      keperluan: formData.get("keperluan"),
      tanggal: formData.get("tanggal"),
      jamMasuk: formData.get("jamMasuk"),
      jamKeluar: formData.get("jamKeluar"),
      keterangan: formData.get("keterangan"),
    };
    const result = await tambahBukuTamu(user.villageId, input);
    revalidatePath("/buku-tamu");
    return successState("Buku tamu berhasil ditambahkan.", { id: result.id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambah buku tamu.");
  }
}

export async function updateBukuTamuAction(
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
      instansi: formData.get("instansi"),
      keperluan: formData.get("keperluan"),
      tanggal: formData.get("tanggal"),
      jamMasuk: formData.get("jamMasuk"),
      jamKeluar: formData.get("jamKeluar"),
      keterangan: formData.get("keterangan"),
    };
    await ubahBukuTamu(user.villageId, id, input);
    revalidatePath("/buku-tamu");
    return successState("Buku tamu berhasil diperbarui.", { id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui buku tamu.");
  }
}

export async function deleteBukuTamuAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    await hapusBukuTamu(user.villageId, id);
    revalidatePath("/buku-tamu");
    return successState("Buku tamu berhasil dihapus.", { id });
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus buku tamu.");
  }
}
