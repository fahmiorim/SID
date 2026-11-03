"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import { hapusPemilihan, simpanPemilihan, ubahPemilihan } from "../application/pemilihan-use-cases";

const PATH = "/desa/pemilihan";

function inputDariForm(formData: FormData) {
  return {
    tahun: formData.get("tahun"),
    jenis: formData.get("jenis"),
    tanggal: formData.get("tanggal")?.toString().trim() || null,
    keterangan: formData.get("keterangan")?.toString().trim() || null,
  };
}

export async function simpanPemilihanAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id"));
    const input = inputDariForm(formData);

    if (id) {
      await ubahPemilihan(user.villageId, id, input);
      revalidatePath(PATH);
      return successState("Pemilihan berhasil diperbarui.");
    }

    const idBaru = await simpanPemilihan(user.villageId, input);
    revalidatePath(PATH);
    return successState("Pemilihan berhasil ditambahkan.", { id: idBaru });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menyimpan pemilihan.");
  }
}

export async function hapusPemilihanAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id"));
    if (!id) return errorState("ID pemilihan tidak valid.");

    await hapusPemilihan(user.villageId, id);
    revalidatePath(PATH);
    return successState("Pemilihan berhasil dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus pemilihan.");
  }
}
