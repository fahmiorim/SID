"use server";

import { revalidatePath } from "next/cache";

import {
  deleteElection,
  exportDpt,
  getDpt,
  listElections,
  saveElection,
} from "@/features/penduduk/application/dpt-use-cases";
import {
  type ElectionDTO,
  type ElectionFormInput,
  type ListDptParams,
  type ListDptResult,
} from "@/features/penduduk/domain/dpt";
import { errorState, successState, type ActionState } from "@/lib/action-state";

/** Daftar pemilihan. */
export async function listElectionsAction(): Promise<ElectionDTO[]> {
  return listElections();
}

/** Simpan pemilihan (buat/ubah). */
export async function saveElectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input: ElectionFormInput = {
    judul: formData.get("judul")?.toString().trim() ?? "",
    status: formData.get("status") as "draf" | "aktif" | "selesai",
    tanggal: formData.get("tanggal")?.toString() ?? "",
    keterangan: formData.get("keterangan")?.toString().trim() ?? undefined,
  };
  const id = formData.get("id") ? Number(formData.get("id")) : undefined;

  try {
    await saveElection(input, id);
    revalidatePath("/penduduk/dpt");
    return successState(id ? "Pemilihan diperbarui." : "Pemilihan dibuat.");
  } catch (e) {
    return errorState(e instanceof Error ? e.message : "Gagal menyimpan pemilihan.");
  }
}

/** Hapus pemilihan. */
export async function deleteElectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id"));
  if (!id) return errorState("ID tidak valid.");

  try {
    await deleteElection(id);
    revalidatePath("/penduduk/dpt");
    return successState("Pemilihan dihapus.");
  } catch (e) {
    return errorState(e instanceof Error ? e.message : "Gagal menghapus pemilihan.");
  }
}

/** Daftar DPT dengan filter. */
export async function getDptAction(params: ListDptParams): Promise<ListDptResult> {
  return getDpt(params);
}

/** Ekspor DPT CSV. */
export async function exportDptAction(
  params: ListDptParams,
): Promise<ActionState<{ filename: string }>> {
  try {
    const { csv, filename } = await exportDpt(params);
    return successState(csv, { filename });
  } catch (e) {
    return errorState(e instanceof Error ? e.message : "Gagal ekspor DPT.");
  }
}
