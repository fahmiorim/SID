"use server";

import { revalidatePath } from "next/cache";

import {
  hapusTransaksiPembukuanData,
  simpanTransaksiPembukuanData,
} from "@/features/keuangan/application/pembukuan-use-cases";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

const PEMBUKUAN_PATH = "/keuangan/pembukuan";

/** Simpan satu transaksi pembukuan manual baru. */
export async function simpanTransaksiAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await simpanTransaksiPembukuanData({
      tanggal: formData.get("tanggal"),
      keterangan: formData.get("keterangan"),
      jumlah: formData.get("jumlah"),
      jenis: formData.get("jenis"),
    });
    revalidatePath(PEMBUKUAN_PATH);
    return successState("Transaksi pembukuan disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus satu transaksi pembukuan manual. */
export async function hapusTransaksiAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" ? Number(idRaw) : Number.NaN;
  if (!Number.isInteger(id) || id < 1) return errorState("Transaksi tidak valid.");

  try {
    await hapusTransaksiPembukuanData(id);
    revalidatePath(PEMBUKUAN_PATH);
    return successState("Transaksi dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
