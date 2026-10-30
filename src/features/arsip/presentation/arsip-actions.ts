"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  daftarArsip,
  daftarKategoriArsip,
  hapusArsip,
  tambahArsip,
  ubahArsip,
} from "../application/arsip-use-cases";

export async function listArsipAction(opts?: { kategori?: string; q?: string }) {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarArsip(user.villageId, opts);
}

export async function listKategoriArsipAction() {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return daftarKategoriArsip(user.villageId);
}

export async function createArsipAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const input = {
      kategori: formData.get("kategori"),
      judul: formData.get("judul"),
      berkas: formData.get("berkas"),
      keterangan: formData.get("keterangan"),
    };
    const result = await tambahArsip(user.villageId, input);
    revalidatePath("/arsip");
    return successState("Arsip berhasil ditambahkan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambah arsip.");
  }
}

export async function updateArsipAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    const input = {
      kategori: formData.get("kategori"),
      judul: formData.get("judul"),
      berkas: formData.get("berkas"),
      keterangan: formData.get("keterangan"),
    };
    await ubahArsip(user.villageId, id, input);
    revalidatePath("/arsip");
    return successState("Arsip berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui arsip.");
  }
}

export async function deleteArsipAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");
    const id = Number(formData.get("id"));
    if (!id) return errorState("ID tidak valid.");
    await hapusArsip(user.villageId, id);
    revalidatePath("/arsip");
    return successState("Arsip berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus arsip.");
  }
}
