"use server";

import { revalidatePath } from "next/cache";

import {
  ajukanMutasi,
  hapusInventaris,
  saveInventaris,
  saveInventarisKategori,
  setujuiMutasiData,
  tolakMutasiData,
} from "@/features/inventaris/application/inventaris-use-cases";
import {
  inventarisFormSchema,
  inventarisKategoriFormSchema,
  inventarisMutasiFormSchema,
} from "@/features/inventaris/domain/inventaris";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PATH = "/inventaris";

function text(formData: FormData, name: string) {
  const v = formData.get(name);
  return typeof v === "string" ? v : "";
}

function parseId(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function saveKategoriAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = inventarisKategoriFormSchema.safeParse({
    kode: text(formData, "kode"),
    nama: text(formData, "nama"),
    golongan: text(formData, "golongan"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) return errorState("Periksa kembali isian.", zodToFieldErrors(parsed.error));
  try {
    await saveInventarisKategori(parsed.data, id ?? undefined);
    revalidatePath(PATH);
    return successState(id ? "Kategori diperbarui." : "Kategori disimpan.");
  } catch (e) {
    return toErrorState(e);
  }
}

export async function saveInventarisAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = inventarisFormSchema.safeParse({
    kategoriId: text(formData, "kategoriId"),
    nomorInventaris: text(formData, "nomorInventaris"),
    namaBarang: text(formData, "namaBarang"),
    kodeBarang: text(formData, "kodeBarang"),
    merk: text(formData, "merk"),
    tipe: text(formData, "tipe"),
    spesifikasi: text(formData, "spesifikasi"),
    jumlah: text(formData, "jumlah") || "1",
    satuan: text(formData, "satuan") || "buah",
    hargaSatuan: text(formData, "hargaSatuan"),
    tahunPembelian: text(formData, "tahunPembelian"),
    tanggalPembelian: text(formData, "tanggalPembelian"),
    asal: text(formData, "asal") || undefined,
    donatur: text(formData, "donatur"),
    kondisi: text(formData, "kondisi") || "baik",
    lokasi: text(formData, "lokasi"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) return errorState("Periksa kembali isian.", zodToFieldErrors(parsed.error));
  try {
    await saveInventaris(parsed.data, id ?? undefined);
    revalidatePath(PATH);
    return successState(id ? "Inventaris diperbarui." : "Inventaris disimpan.");
  } catch (e) {
    return toErrorState(e);
  }
}

export async function hapusInventarisAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (!id) return errorState("Data tidak valid");
  try {
    await hapusInventaris(id);
    revalidatePath(PATH);
    return successState("Inventaris dihapus.");
  } catch (e) {
    return toErrorState(e);
  }
}

export async function ajukanMutasiAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = inventarisMutasiFormSchema.safeParse({
    inventarisId: text(formData, "inventarisId"),
    jenis: text(formData, "jenis"),
    tanggalMutasi: text(formData, "tanggalMutasi"),
    lokasiBaru: text(formData, "lokasiBaru"),
    kondisiBaru: text(formData, "kondisiBaru") || undefined,
    jumlahMutasi: text(formData, "jumlahMutasi") || "1",
    alasan: text(formData, "alasan"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) return errorState("Periksa kembali isian.", zodToFieldErrors(parsed.error));
  try {
    await ajukanMutasi(parsed.data);
    revalidatePath(PATH);
    revalidatePath("/inventaris/mutasi");
    return successState("Pengajuan mutasi dikirim.");
  } catch (e) {
    return toErrorState(e);
  }
}

export async function setujuiMutasiAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (!id) return errorState("Data tidak valid");
  try {
    await setujuiMutasiData(id);
    revalidatePath(PATH);
    revalidatePath("/inventaris/mutasi");
    return successState("Mutasi disetujui.");
  } catch (e) {
    return toErrorState(e);
  }
}

export async function tolakMutasiAction(_s: ActionState, formData: FormData): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const catatan = text(formData, "catatanPenolakan");
  if (!id) return errorState("Data tidak valid");
  try {
    await tolakMutasiData(id, catatan);
    revalidatePath(PATH);
    revalidatePath("/inventaris/mutasi");
    return successState("Mutasi ditolak.");
  } catch (e) {
    return toErrorState(e);
  }
}
