"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  hapusIndikatorAnalisis,
  hapusKategoriAnalisis,
  simpanIndikatorAnalisis,
  simpanKategoriAnalisis,
} from "../application/analisis-use-cases";

const PATH = "/analisis";

function pesanKesalahan(error: unknown, fallback: string) {
  if (error instanceof Error && error.name === "ZodError") {
    return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
  }
  return errorState(isAppError(error) ? error.message : fallback);
}

export async function simpanKategoriAnalisisAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id")) || undefined;
    const hasil = await simpanKategoriAnalisis(
      user.villageId,
      {
        nama: formData.get("nama"),
        keterangan: formData.get("keterangan"),
      },
      id,
    );

    revalidatePath(PATH);
    return successState(id ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan.", {
      id: hasil,
    });
  } catch (error) {
    return pesanKesalahan(error, "Gagal menyimpan kategori analisis.");
  }
}

export async function hapusKategoriAnalisisAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id"));
    if (!id) return errorState("ID kategori tidak valid.");

    await hapusKategoriAnalisis(user.villageId, id);
    revalidatePath(PATH);
    return successState("Kategori berhasil dihapus.");
  } catch (error) {
    return pesanKesalahan(error, "Gagal menghapus kategori analisis.");
  }
}

export async function simpanIndikatorAnalisisAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id")) || undefined;
    const hasil = await simpanIndikatorAnalisis(
      user.villageId,
      {
        kategoriId: formData.get("kategoriId"),
        kode: formData.get("kode"),
        nama: formData.get("nama"),
        keterangan: formData.get("keterangan"),
      },
      id,
    );

    revalidatePath(PATH);
    return successState(id ? "Indikator berhasil diperbarui." : "Indikator berhasil ditambahkan.", {
      id: hasil,
    });
  } catch (error) {
    return pesanKesalahan(error, "Gagal menyimpan indikator analisis.");
  }
}

export async function hapusIndikatorAnalisisAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id"));
    if (!id) return errorState("ID indikator tidak valid.");

    await hapusIndikatorAnalisis(user.villageId, id);
    revalidatePath(PATH);
    return successState("Indikator berhasil dihapus.");
  } catch (error) {
    return pesanKesalahan(error, "Gagal menghapus indikator analisis.");
  }
}
