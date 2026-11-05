"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  hapusProdukLapak,
  tambahProdukLapak,
  ubahProdukLapak,
} from "../application/lapak-product-use-cases";

export async function createProdukLapakAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const lapakId = Number(formData.get("lapakId"));
    if (!lapakId || lapakId < 1) return errorState("Lapak tidak valid.");

    const input = {
      nama: formData.get("nama"),
      deskripsi: formData.get("deskripsi"),
      harga: formData.get("harga"),
      stok: formData.get("stok"),
      gambar: formData.get("gambar"),
      aktif: formData.get("aktif") === "on" || formData.get("aktif") === "true",
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
    };

    const result = await tambahProdukLapak(user.villageId, lapakId, input);
    revalidatePath(`/lapak/${lapakId}/produk`);
    return successState("Produk berhasil ditambahkan.", result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambah produk.");
  }
}

export async function updateProdukLapakAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id"));
    const lapakId = Number(formData.get("lapakId"));
    if (!id || !lapakId) return errorState("ID tidak valid.");

    const input = {
      nama: formData.get("nama"),
      deskripsi: formData.get("deskripsi"),
      harga: formData.get("harga"),
      stok: formData.get("stok"),
      gambar: formData.get("gambar"),
      aktif: formData.get("aktif") === "on" || formData.get("aktif") === "true",
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
    };

    await ubahProdukLapak(user.villageId, lapakId, id, input);
    revalidatePath(`/lapak/${lapakId}/produk`);
    return successState("Produk berhasil diperbarui.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal memperbarui produk.");
  }
}

export async function deleteProdukLapakAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id"));
    const lapakId = Number(formData.get("lapakId"));
    if (!id || !lapakId) return errorState("ID tidak valid.");

    await hapusProdukLapak(user.villageId, lapakId, id);
    revalidatePath(`/lapak/${lapakId}/produk`);
    return successState("Produk berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus produk.");
  }
}
