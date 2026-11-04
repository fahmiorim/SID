"use server";

import { revalidatePath } from "next/cache";

/* -------------------------------------------------------------------------- */
/* OS-FIN-011 Tanah Kas                                                       */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* OS-FIN-012 Pembangunan                                                     */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* OS-FIN-013 Sekretariat                                                     */
/* -------------------------------------------------------------------------- */ import {
  getBukuDetailData,
  getDaftarBukuData,
  getDaftarPembangunanData,
  getDaftarSekretariatData,
  getDaftarTanahKasData,
  hapusAgendaData,
  hapusAparatData,
  hapusItemBukuData,
  hapusKaderData,
  hapusMutasiTanahKasData,
  hapusPembangunanData,
  hapusPeraturanData,
  hapusTanahKasData,
  simpanAgendaData,
  simpanAparatData,
  simpanItemBukuData,
  simpanKaderData,
  simpanMutasiTanahKasData,
  simpanPembangunanData,
  simpanPeraturanData,
  simpanTanahKasData,
  sinkronisasiBumindesDariPenduduk,
} from "@/features/bumindes/application/use-cases";
import { itemBukuFormSchema } from "@/features/bumindes/domain/bumindes";
import { kaderFormSchema, pembangunanFormSchema } from "@/features/bumindes/domain/pembangunan";
import {
  agendaFormSchema,
  aparatFormSchema,
  peraturanFormSchema,
} from "@/features/bumindes/domain/sekretariat";
import { tanahKasFormSchema, tanahKasMutasiFormSchema } from "@/features/bumindes/domain/tanah-kas";
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

const PATH_TANAH_KAS = "/bumindes/tanah-kas";

export async function getTanahKasData() {
  return getDaftarTanahKasData();
}

export async function simpanTanahKasAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = tanahKasFormSchema.safeParse({
    nomorPersil: text(formData, "nomorPersil"),
    asal: text(formData, "asal"),
    luas: text(formData, "luas"),
    lokasi: text(formData, "lokasi"),
    status: text(formData, "status"),
    nilai: text(formData, "nilai"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }
  try {
    await simpanTanahKasData(id, parsed.data);
    revalidatePath(PATH_TANAH_KAS);
    return successState(id === null ? "Persil ditambahkan." : "Persil diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusTanahKasAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");
  try {
    await hapusTanahKasData(id);
    revalidatePath(PATH_TANAH_KAS);
    return successState("Persil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function simpanMutasiTanahKasAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = tanahKasMutasiFormSchema.safeParse({
    tanahKasId: text(formData, "tanahKasId"),
    tanggal: text(formData, "tanggal"),
    jenis: text(formData, "jenis"),
    uraian: text(formData, "uraian"),
    luasPerubahan: text(formData, "luasPerubahan"),
    nilaiPerubahan: text(formData, "nilaiPerubahan"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }
  try {
    await simpanMutasiTanahKasData(parsed.data);
    revalidatePath(PATH_TANAH_KAS);
    return successState("Mutasi ditambahkan.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusMutasiTanahKasAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");
  try {
    await hapusMutasiTanahKasData(id);
    revalidatePath(PATH_TANAH_KAS);
    return successState("Mutasi dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

const PATH_PEMBANGUNAN = "/bumindes/pembangunan";

export async function getPembangunanData(tahun?: number) {
  return getDaftarPembangunanData(tahun);
}

export async function simpanPembangunanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = pembangunanFormSchema.safeParse({
    tahun: text(formData, "tahun"),
    namaKegiatan: text(formData, "namaKegiatan"),
    lokasi: text(formData, "lokasi"),
    volume: text(formData, "volume"),
    sumberDana: text(formData, "sumberDana"),
    biaya: text(formData, "biaya"),
    pelaksana: text(formData, "pelaksana"),
    status: text(formData, "status") || "rencana",
    tanggalMulai: text(formData, "tanggalMulai"),
    tanggalSelesai: text(formData, "tanggalSelesai"),
    hasil: text(formData, "hasil"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }
  try {
    await simpanPembangunanData(id, parsed.data);
    revalidatePath(PATH_PEMBANGUNAN);
    return successState(id === null ? "Kegiatan ditambahkan." : "Kegiatan diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusPembangunanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");
  try {
    await hapusPembangunanData(id);
    revalidatePath(PATH_PEMBANGUNAN);
    return successState("Kegiatan dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function simpanKaderAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = kaderFormSchema.safeParse({
    nama: text(formData, "nama"),
    jabatan: text(formData, "jabatan"),
    bidang: text(formData, "bidang"),
    alamat: text(formData, "alamat"),
    noHp: text(formData, "noHp"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }
  try {
    await simpanKaderData(id, parsed.data);
    revalidatePath(PATH_PEMBANGUNAN);
    revalidatePath(`${PATH_PEMBANGUNAN}/kader`);
    return successState(id === null ? "Kader ditambahkan." : "Kader diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusKaderAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");
  try {
    await hapusKaderData(id);
    revalidatePath(PATH_PEMBANGUNAN);
    revalidatePath(`${PATH_PEMBANGUNAN}/kader`);
    return successState("Kader dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

const PATH_SEKRETARIAT = "/bumindes/sekretariat";

export async function getSekretariatData(jenis?: string) {
  return getDaftarSekretariatData(jenis);
}

export async function simpanPeraturanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = peraturanFormSchema.safeParse({
    jenis: text(formData, "jenis") || "peraturan_desa",
    nomor: text(formData, "nomor"),
    tahun: text(formData, "tahun"),
    tentang: text(formData, "tentang"),
    tanggalDitetapkan: text(formData, "tanggalDitetapkan"),
    tanggalDiundangkan: text(formData, "tanggalDiundangkan"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }
  try {
    await simpanPeraturanData(id, parsed.data);
    revalidatePath(PATH_SEKRETARIAT);
    revalidatePath(`${PATH_SEKRETARIAT}/peraturan`);
    return successState(
      id === null ? "Peraturan/Keputusan ditambahkan." : "Peraturan/Keputusan diperbarui.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusPeraturanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");
  try {
    await hapusPeraturanData(id);
    revalidatePath(PATH_SEKRETARIAT);
    revalidatePath(`${PATH_SEKRETARIAT}/peraturan`);
    return successState("Peraturan/Keputusan dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function simpanAparatAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = aparatFormSchema.safeParse({
    nama: text(formData, "nama"),
    nip: text(formData, "nip"),
    jabatan: text(formData, "jabatan"),
    tempatLahir: text(formData, "tempatLahir"),
    tanggalLahir: text(formData, "tanggalLahir"),
    pendidikan: text(formData, "pendidikan"),
    nomorSkPengangkatan: text(formData, "nomorSkPengangkatan"),
    tanggalPengangkatan: text(formData, "tanggalPengangkatan"),
    nomorSkPemberhentian: text(formData, "nomorSkPemberhentian"),
    tanggalPemberhentian: text(formData, "tanggalPemberhentian"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }
  try {
    await simpanAparatData(id, parsed.data);
    revalidatePath(PATH_SEKRETARIAT);
    revalidatePath(`${PATH_SEKRETARIAT}/aparat`);
    return successState(id === null ? "Aparat ditambahkan." : "Aparat diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusAparatAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");
  try {
    await hapusAparatData(id);
    revalidatePath(PATH_SEKRETARIAT);
    revalidatePath(`${PATH_SEKRETARIAT}/aparat`);
    return successState("Aparat dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function simpanAgendaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const parsed = agendaFormSchema.safeParse({
    jenis: text(formData, "jenis") || "masuk",
    tanggal: text(formData, "tanggal"),
    nomorSurat: text(formData, "nomorSurat"),
    asalTujuan: text(formData, "asalTujuan"),
    perihal: text(formData, "perihal"),
    keterangan: text(formData, "keterangan"),
  });
  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }
  try {
    await simpanAgendaData(id, parsed.data);
    revalidatePath(PATH_SEKRETARIAT);
    revalidatePath(`${PATH_SEKRETARIAT}/agenda`);
    return successState(id === null ? "Agenda ditambahkan." : "Agenda diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusAgendaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");
  try {
    await hapusAgendaData(id);
    revalidatePath(PATH_SEKRETARIAT);
    revalidatePath(`${PATH_SEKRETARIAT}/agenda`);
    return successState("Agenda dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
