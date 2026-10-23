"use server";

import { revalidatePath } from "next/cache";

import {
  ajukanMutasi,
  hapusInventaris,
  hapusInventarisKategori,
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
const KATEGORI_PATH = "/inventaris/kategori";
const MUTASI_PATH = "/inventaris/mutasi";

function text(formData: FormData, name: string) {
  const v = formData.get(name);
  return typeof v === "string" ? v : "";
}

function parseId(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function optionalNumber(formData: FormData, name: string) {
  const value = text(formData, name).trim();
  return value === "" ? undefined : value;
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
    revalidatePath(KATEGORI_PATH);
    return successState(id ? "Kategori diperbarui." : "Kategori disimpan.");
  } catch (e) {
    return toErrorState(e);
  }
}

export async function hapusKategoriAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (!id) return errorState("Data tidak valid");
  try {
    await hapusInventarisKategori(id);
    revalidatePath(PATH);
    revalidatePath(KATEGORI_PATH);
    return successState("Kategori dihapus.");
  } catch (e) {
    return toErrorState(e);
  }
}

export async function saveInventarisAction(
  _s: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const kategoriId = text(formData, "kategoriId");
  const asal = text(formData, "asal");
  const parsed = inventarisFormSchema.safeParse({
    kategoriId: kategoriId === "none" ? "" : kategoriId,
    nomorInventaris: text(formData, "nomorInventaris"),
    namaBarang: text(formData, "namaBarang"),
    kodeBarang: text(formData, "kodeBarang"),
    merk: text(formData, "merk"),
    tipe: text(formData, "tipe"),
    spesifikasi: text(formData, "spesifikasi"),
    jumlah: text(formData, "jumlah") || "1",
    satuan: text(formData, "satuan") || "buah",
    hargaSatuan: optionalNumber(formData, "hargaSatuan"),
    tahunPembelian: optionalNumber(formData, "tahunPembelian"),
    tanggalPembelian: text(formData, "tanggalPembelian"),
    asal: asal === "none" || asal === "" ? undefined : asal,
    donatur: text(formData, "donatur"),
    kondisi: text(formData, "kondisi") || "baik",
    lokasi: text(formData, "lokasi"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) return errorState("Periksa kembali isian.", zodToFieldErrors(parsed.error));
  try {
    await saveInventaris(parsed.data, id ?? undefined);
    revalidatePath(PATH);
    revalidatePath(MUTASI_PATH);
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
    revalidatePath(MUTASI_PATH);
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
    revalidatePath(MUTASI_PATH);
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
    const { step, selesai } = await setujuiMutasiData(id);
    revalidatePath(PATH);
    revalidatePath(MUTASI_PATH);
    return successState(
      selesai
        ? `Mutasi disetujui tahap ${step} dan perubahan aset telah diterapkan.`
        : `Mutasi disetujui tahap ${step}. Menunggu tahap berikutnya.`,
    );
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
    revalidatePath(MUTASI_PATH);
    return successState("Mutasi ditolak.");
  } catch (e) {
    return toErrorState(e);
  }
}
