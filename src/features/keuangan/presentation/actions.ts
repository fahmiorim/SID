"use server";

import { revalidatePath } from "next/cache";

import { saveKeuanganData } from "@/features/keuangan/application/keuangan-use-cases";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

const KEUANGAN_PATH = "/keuangan";

/**
 * Simpan nilai anggaran & realisasi untuk banyak rekening sekaligus.
 *
 * Baris dikirim sebagai `rows` berformat JSON karena jumlahnya banyak dan
 * dinamis (mengikuti pohon rekening), sehingga tidak praktis memakai satu field
 * per baris.
 */
export async function saveKeuanganAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tahunRaw = formData.get("tahun");
  const rowsRaw = formData.get("rows");

  const tahun = typeof tahunRaw === "string" ? Number(tahunRaw) : Number.NaN;
  if (!Number.isInteger(tahun)) return errorState("Tahun anggaran tidak valid.");

  if (typeof rowsRaw !== "string" || rowsRaw.trim() === "") {
    return errorState("Tidak ada perubahan untuk disimpan.");
  }

  let rows: unknown;
  try {
    rows = JSON.parse(rowsRaw);
  } catch {
    return errorState("Data baris keuangan tidak dapat dibaca.");
  }

  if (!Array.isArray(rows)) return errorState("Data baris keuangan tidak valid.");

  try {
    await saveKeuanganData(tahun, rows);
    revalidatePath(KEUANGAN_PATH);
    revalidatePath(`${KEUANGAN_PATH}/anggaran`);
    return successState("Anggaran & realisasi disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}
