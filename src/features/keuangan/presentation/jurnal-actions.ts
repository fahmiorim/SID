"use server";

import { revalidatePath } from "next/cache";

import {
  hapusJurnalPembukuanData,
  simpanJurnalPembukuanData,
  simpanSaldoBankPembukuanData,
} from "@/features/keuangan/application/jurnal-use-cases";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

const JURNAL_PATH = "/keuangan/jurnal";

/** Simpan satu entri jurnal umum (debet atau kredit). */
export async function simpanJurnalAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await simpanJurnalPembukuanData({
      tahun: formData.get("tahun"),
      tanggal: formData.get("tanggal"),
      kodeRekening: formData.get("kodeRekening"),
      uraian: formData.get("uraian"),
      debet: formData.get("debet") ?? 0,
      kredit: formData.get("kredit") ?? 0,
      referensi: formData.get("referensi") ?? "",
    });
    revalidatePath(JURNAL_PATH);
    return successState("Entri jurnal disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus satu entri jurnal milik desa sesi. */
export async function hapusJurnalAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" ? Number(idRaw) : Number.NaN;
  if (!Number.isInteger(id) || id < 1) return errorState("Entri jurnal tidak valid.");

  try {
    await hapusJurnalPembukuanData(id);
    revalidatePath(JURNAL_PATH);
    return successState("Entri jurnal dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Simpan (upsert) saldo awal satu rekening bank. */
export async function simpanSaldoBankAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await simpanSaldoBankPembukuanData({
      tahun: formData.get("tahun"),
      rekeningBank: formData.get("rekeningBank"),
      namaBank: formData.get("namaBank"),
      saldoAwal: formData.get("saldoAwal") ?? 0,
    });
    revalidatePath(JURNAL_PATH);
    return successState("Saldo awal rekening disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}
