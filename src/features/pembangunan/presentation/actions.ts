"use server";

import { revalidatePath } from "next/cache";

import {
  addDokumentasi,
  createPembangunan,
  deleteDokumentasi,
  deletePembangunan,
  updatePembangunan,
} from "@/features/pembangunan/application/use-cases";
import {
  dokumentasiFormSchema,
  pembangunanFormSchema,
} from "@/features/pembangunan/domain/pembangunan";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PEMBANGUNAN_PATH = "/pembangunan";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

async function ambilBerkas(formData: FormData, name: string): Promise<BerkasUnggahan | null> {
  const value = formData.get(name);
  if (!(value instanceof File) || value.size === 0) return null;

  return {
    nama: value.name,
    mime: value.type || null,
    ukuran: value.size,
    isi: new Uint8Array(await value.arrayBuffer()),
  };
}

/** Simpan proyek pembangunan (tambah bila `id` kosong, ubah bila ada). */
export async function savePembangunanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = pembangunanFormSchema.safeParse({
    judul: text(formData, "judul"),
    deskripsi: text(formData, "deskripsi"),
    lokasi: text(formData, "lokasi"),
    tahunAnggaran: text(formData, "tahunAnggaran"),
    sumberDana: text(formData, "sumberDana"),
    anggaran: text(formData, "anggaran"),
    volume: text(formData, "volume"),
    satuan: text(formData, "satuan"),
    pelaksana: text(formData, "pelaksana"),
    mulai: text(formData, "mulai"),
    selesai: text(formData, "selesai"),
    status: text(formData, "status"),
    progres: text(formData, "progres"),
    hasil: text(formData, "hasil"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createPembangunan(parsed.data);
    } else {
      await updatePembangunan(id, parsed.data);
    }

    revalidatePath(PEMBANGUNAN_PATH);
    revalidatePath("/desa/pembangunan");
    return successState(
      id === null ? "Proyek pembangunan ditambahkan." : "Proyek pembangunan diperbarui.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus proyek pembangunan. */
export async function deletePembangunanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data proyek pembangunan tidak valid.");
  }

  try {
    await deletePembangunan(id);
    revalidatePath(PEMBANGUNAN_PATH);
    revalidatePath("/desa/pembangunan");
    return successState("Proyek pembangunan dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Unggah satu foto dokumentasi proyek. */
export async function saveDokumentasiAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const proyekId = parseId(formData.get("proyekId"));

  if (proyekId === null) {
    return errorState("Data proyek pembangunan tidak valid.");
  }

  const parsed = dokumentasiFormSchema.safeParse({
    judul: text(formData, "judul"),
    keterangan: text(formData, "keterangan"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    const berkas = await ambilBerkas(formData, "gambar");
    await addDokumentasi(proyekId, parsed.data, berkas);

    revalidatePath(`${PEMBANGUNAN_PATH}/${proyekId}`);
    revalidatePath("/desa/pembangunan");
    return successState("Dokumentasi ditambahkan.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus satu foto dokumentasi. */
export async function deleteDokumentasiAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data dokumentasi tidak valid.");
  }

  try {
    await deleteDokumentasi(id);
    revalidatePath(PEMBANGUNAN_PATH);
    revalidatePath("/desa/pembangunan");
    return successState("Dokumentasi dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
