"use server";

import { revalidatePath } from "next/cache";

import {
  getBukuDetailData,
  getDaftarBukuData,
  hapusItemBukuData,
  simpanItemBukuData,
  sinkronisasiBumindesDariPenduduk,
} from "@/features/bumindes/application/use-cases";
import { itemBukuFormSchema } from "@/features/bumindes/domain/bumindes";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PATH = "/bumindes/buku-administrasi";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Daftar buku untuk halaman indeks. */
export async function getBumindesData() {
  const buku = await getDaftarBukuData();
  return { buku };
}

/** Detail buku + item untuk halaman buku. */
export async function getBumindesDetail(bukuId: number) {
  return getBukuDetailData(bukuId);
}

/** Tambah/ubah item buku (tambah bila `id` kosong). */
export async function simpanItemBukuAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = itemBukuFormSchema.safeParse({
    bukuId: text(formData, "bukuId"),
    nomorUrut: text(formData, "nomorUrut"),
    tanggal: text(formData, "tanggal"),
    uraian: text(formData, "uraian"),
    keterangan: text(formData, "keterangan"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    const hasil = await simpanItemBukuData(id, parsed.data);
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${hasil.bukuId}`);
    return successState(id === null ? "Item ditambahkan." : "Item diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus item buku. */
export async function hapusItemBukuAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");

  try {
    const hasil = await hapusItemBukuData(id);
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${hasil.bukuId}`);
    return successState("Item dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Sinkronisasi ringkasan buku dari data penduduk. */
export async function sinkronisasiBumindesAction(): Promise<ActionState> {
  try {
    const hasil = await sinkronisasiBumindesDariPenduduk();
    revalidatePath(PATH);
    return successState(hasil.pesan);
  } catch (error) {
    return toErrorState(error);
  }
}
