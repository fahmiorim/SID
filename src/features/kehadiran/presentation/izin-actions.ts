"use server";

import { revalidatePath } from "next/cache";

import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

import {
  ajukanIzinWargaData,
  putuskanIzinData,
  simpanPengaturanKehadiranData,
} from "../application/izin-use-cases";

export async function ajukanIzinWargaAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const hasil = await ajukanIzinWargaData({
      jenis: formData.get("jenis"),
      tanggalMulai: formData.get("tanggalMulai"),
      tanggalSelesai: formData.get("tanggalSelesai"),
      alasan: formData.get("alasan"),
    });
    revalidatePath("/layanan-mandiri/izin");
    revalidatePath("/kehadiran/izin");
    return successState("Pengajuan izin terkirim dan menunggu persetujuan.", hasil);
  } catch (error) {
    return toErrorState(error);
  }
}

export async function putuskanIzinAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  try {
    await putuskanIzinData({
      id: formData.get("id"),
      status: formData.get("status"),
      catatan: formData.get("catatan"),
    });
    revalidatePath("/kehadiran/izin");
    revalidatePath("/layanan-mandiri/izin");
    return successState("Keputusan izin tersimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function simpanPengaturanKehadiranAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  const hariLibur = formData
    .getAll("hariLibur")
    .map(Number)
    .filter((value) => Number.isInteger(value));

  if (hariLibur.length === 0 && formData.get("hariLiburAktif") === "1") {
    // Minggu sebagai default bila pengguna mengosongkan pilihan.
    hariLibur.push(0);
  }

  try {
    await simpanPengaturanKehadiranData({
      jamMasuk: formData.get("jamMasuk"),
      jamKeluar: formData.get("jamKeluar"),
      hariLibur,
    });
    revalidatePath("/kehadiran/izin");
    revalidatePath("/kehadiran");
    return successState("Pengaturan jam kerja tersimpan.");
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Periksa kembali jam kerja dan hari libur.");
    }
    return toErrorState(error);
  }
}
