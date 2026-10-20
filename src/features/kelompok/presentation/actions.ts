"use server";

import { revalidatePath } from "next/cache";

import {
  addAnggotaKelompok,
  createKategori,
  createKelompok,
  deleteKategori,
  deleteKelompok,
  getKelompokMembers,
  getReferensiKelompok,
  listAnggotaKandidat,
  listKategoriKelompok,
  removeAnggotaKelompok,
  updateKategori,
  updateKelompok,
} from "@/features/kelompok/application/use-cases";
import {
  anggotaKelompokFormSchema,
  kategoriKelompokFormSchema,
  kelompokFormSchema,
  type KategoriKelompokDTO,
  type KelompokMember,
  type KelompokReferenceData,
} from "@/features/kelompok/domain/kelompok";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";
import type { LabelOption } from "@/lib/forms";

const KELOMPOK_PATH = "/kelompok";
const KATEGORI_PATH = "/kelompok/kategori";

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Ambil nilai teks dari FormData (string kosong bila tidak ada). */
function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Simpan kelompok/lembaga (tambah bila `id` kosong, ubah bila ada).
 *
 * Slug tidak diambil dari formulir — dibangkitkan use case. Izin & validasi
 * ditegakkan di server (use case + Zod); UI hanya menyajikan.
 */
export async function saveKelompokAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = kelompokFormSchema.safeParse({
    nama: text(formData, "nama"),
    tipe: text(formData, "tipe"),
    kategoriId: text(formData, "kategoriId"),
    kode: text(formData, "kode"),
    nomorSk: text(formData, "nomorSk"),
    keterangan: text(formData, "keterangan"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createKelompok(parsed.data);
    } else {
      await updateKelompok(id, parsed.data);
    }

    revalidatePath(KELOMPOK_PATH);
    return successState(id === null ? "Kelompok ditambahkan." : "Kelompok diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus kelompok berdasarkan `id`. */
export async function deleteKelompokAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data kelompok tidak valid.");
  }

  try {
    await deleteKelompok(id);
    revalidatePath(KELOMPOK_PATH);
    return successState("Kelompok dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Muat data referensi kelompok (kategori + penduduk kandidat). */
export async function loadReferensiKelompokAction(
  kelompokId: number | null,
): Promise<KelompokReferenceData> {
  return getReferensiKelompok(kelompokId);
}

// --- Anggota ----------------------------------------------------------------

export interface KelompokMembersResult {
  ok: boolean;
  members?: KelompokMember[];
  kandidat?: LabelOption[];
  reference?: KelompokReferenceData;
  message?: string;
}

/** Muat anggota + kandidat + referensi sebuah kelompok untuk dialog. */
export async function loadKelompokMembersAction(
  kelompokId: number,
): Promise<KelompokMembersResult> {
  if (!Number.isInteger(kelompokId) || kelompokId <= 0) {
    return { ok: false, message: "Data kelompok tidak valid." };
  }

  try {
    const [members, kandidat, reference] = await Promise.all([
      getKelompokMembers(kelompokId),
      listAnggotaKandidat(kelompokId),
      getReferensiKelompok(kelompokId),
    ]);

    return { ok: true, members, kandidat, reference };
  } catch (error) {
    const state = toErrorState(error);
    return { ok: false, message: state.status === "error" ? state.message : "Gagal memuat data." };
  }
}

/** Tambah anggota kelompok. */ export async function addAnggotaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const kelompokId = parseId(formData.get("kelompokId"));

  if (kelompokId === null) {
    return errorState("Data kelompok tidak valid.");
  }

  const parsed = anggotaKelompokFormSchema.safeParse({
    residentId: text(formData, "residentId"),
    jabatan: text(formData, "jabatan"),
    nomorAnggota: text(formData, "nomorAnggota"),
    nomorSk: text(formData, "nomorSk"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    await addAnggotaKelompok(kelompokId, parsed.data);
    revalidatePath(KELOMPOK_PATH);
    return successState("Anggota kelompok ditambahkan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Keluarkan anggota kelompok. */
export async function removeAnggotaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const kelompokId = parseId(formData.get("kelompokId"));
  const memberId = parseId(formData.get("memberId"));

  if (kelompokId === null || memberId === null) {
    return errorState("Data anggota tidak valid.");
  }

  try {
    await removeAnggotaKelompok(kelompokId, memberId);
    revalidatePath(KELOMPOK_PATH);
    return successState("Anggota dikeluarkan dari kelompok.");
  } catch (error) {
    return toErrorState(error);
  }
}

// --- Kategori ---------------------------------------------------------------

export interface KategoriLoadResult {
  ok: boolean;
  kategori?: KategoriKelompokDTO[];
  message?: string;
}

/** Muat daftar kategori (untuk dialog kategori). */
export async function loadKategoriAction(): Promise<KategoriLoadResult> {
  try {
    return { ok: true, kategori: await listKategoriKelompok() };
  } catch (error) {
    const state = toErrorState(error);
    return { ok: false, message: state.status === "error" ? state.message : "Gagal memuat data." };
  }
}

/** Simpan kategori kelompok (tambah bila `id` kosong, ubah bila ada). */
export async function saveKategoriAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = kategoriKelompokFormSchema.safeParse({
    nama: text(formData, "nama"),
    tipe: text(formData, "tipe"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createKategori(parsed.data);
    } else {
      await updateKategori(id, parsed.data);
    }

    revalidatePath(KATEGORI_PATH);
    revalidatePath(KELOMPOK_PATH);
    return successState(id === null ? "Kategori ditambahkan." : "Kategori diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus kategori kelompok. */
export async function deleteKategoriAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data kategori tidak valid.");
  }

  try {
    await deleteKategori(id);
    revalidatePath(KATEGORI_PATH);
    revalidatePath(KELOMPOK_PATH);
    return successState("Kategori dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
