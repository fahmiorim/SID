"use server";

import { revalidatePath } from "next/cache";

import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

import {
  hapusLapakWargaData,
  tambahLapakWargaData,
  ubahLapakWargaData,
} from "../application/lapak-warga-use-cases";

function teks(formData: FormData, name: string): unknown {
  return formData.get(name);
}

export async function tambahLapakWargaAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  try {
    const hasil = await tambahLapakWargaData({
      nama: teks(formData, "nama"),
      kategori: teks(formData, "kategori"),
      alamat: teks(formData, "alamat"),
      keterangan: teks(formData, "keterangan"),
    });
    revalidatePath("/layanan-mandiri/lapak");
    revalidatePath("/lapak");
    return successState("Lapak berhasil ditambahkan.", hasil);
  } catch (error) {
    return toErrorState(error);
  }
}

export async function ubahLapakWargaAction(
  _prev: ActionState<{ id: number } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number } | null>> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return errorState("Lapak tidak valid.");

  try {
    await ubahLapakWargaData(id, {
      nama: teks(formData, "nama"),
      kategori: teks(formData, "kategori"),
      alamat: teks(formData, "alamat"),
      keterangan: teks(formData, "keterangan"),
    });
    revalidatePath("/layanan-mandiri/lapak");
    revalidatePath("/lapak");
    return successState("Lapak berhasil diperbarui.", null);
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusLapakWargaAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return errorState("Lapak tidak valid.");

  try {
    await hapusLapakWargaData(id);
    revalidatePath("/layanan-mandiri/lapak");
    revalidatePath("/lapak");
    return successState("Lapak berhasil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
