"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

import {
  daftarKandidat,
  hapusKandidat,
  hapusPemilihan,
  simpanKandidat,
  simpanPemilihan,
  ubahPemilihan,
  type KandidatData,
} from "../application/pemilihan-use-cases";

const PATH = "/pemerintahan/pemilihan";

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

/** Simpan kandidat (tambah/ubah) beserta perolehan suaranya. */
export async function simpanKandidatAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const pemilihanId = Number(formData.get("pemilihanId"));
    if (!Number.isInteger(pemilihanId) || pemilihanId < 1) {
      return errorState("Data pemilihan tidak valid.");
    }

    const id = Number(formData.get("id")) || null;
    const input = {
      nomorUrut: formData.get("nomorUrut"),
      nama: formData.get("nama"),
      keterangan: formData.get("keterangan")?.toString().trim() || null,
      jumlahSuara: formData.get("jumlahSuara"),
    };

    await simpanKandidat(user.villageId, pemilihanId, input, id);
    revalidatePath(PATH);
    revalidatePath("/desa/pemilihan");
    return successState(id ? "Kandidat diperbarui." : "Kandidat ditambahkan.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Validasi gagal.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menyimpan kandidat.");
  }
}

/** Hapus kandidat. */
export async function hapusKandidatAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return errorState("Desa tidak ditemukan.");

    const id = Number(formData.get("id"));
    if (!id) return errorState("ID kandidat tidak valid.");

    await hapusKandidat(user.villageId, id);
    revalidatePath(PATH);
    revalidatePath("/desa/pemilihan");
    return successState("Kandidat dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus kandidat.");
  }
}

/** Muat kandidat + rekap untuk dialog pengelolaan. */
export async function loadKandidatAction(
  pemilihanId: number,
): Promise<{ ok: true; data: KandidatData } | { ok: false; message: string }> {
  try {
    const user = await getCurrentUser();
    if (!user?.villageId) return { ok: false, message: "Desa tidak ditemukan." };

    const data = await daftarKandidat(user.villageId, pemilihanId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: isAppError(error) ? error.message : "Gagal memuat data kandidat.",
    };
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
