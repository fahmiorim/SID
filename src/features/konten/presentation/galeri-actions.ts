"use server";

import { revalidatePath } from "next/cache";

import type { BerkasUnggahan } from "@/features/publik/domain/media";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

import {
  createAlbum,
  deleteAlbum,
  deleteFoto,
  unggahFoto,
  updateAlbum,
  updateFoto,
  type MediaAlbum,
} from "../application/galeri-use-cases";
import { albumFormSchema, fotoFormSchema } from "../domain/galeri";

const GALERI_PATH = "/konten/galeri";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Baca satu berkas opsional dari `FormData`. */
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

/** Baca semua berkas dari input `multiple`. */
async function ambilBanyakBerkas(formData: FormData, name: string): Promise<BerkasUnggahan[]> {
  const nilai = formData.getAll(name).filter((item): item is File => item instanceof File);

  const hasil: BerkasUnggahan[] = [];
  for (const berkas of nilai) {
    if (berkas.size === 0) continue;
    hasil.push({
      nama: berkas.name,
      mime: berkas.type || null,
      ukuran: berkas.size,
      isi: new Uint8Array(await berkas.arrayBuffer()),
    });
  }

  return hasil;
}

/** Simpan album (tambah bila `id` kosong, ubah bila ada). */
export async function simpanAlbumAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = albumFormSchema.safeParse({
    nama: text(formData, "nama"),
    keterangan: text(formData, "keterangan"),
    urut: text(formData, "urut"),
    aktif: formData.get("aktif") === "on",
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian album.", zodToFieldErrors(parsed.error));
  }

  const sampul = await ambilBerkas(formData, "sampul");
  if (sampul && !sampul.mime?.startsWith("image/")) {
    return errorState("Sampul album harus berupa gambar.", {
      sampul: ["Pilih berkas gambar (JPG, PNG, WEBP, GIF, atau SVG)."],
    });
  }

  const media: MediaAlbum = {};
  if (sampul) media.sampul = sampul;

  try {
    if (id === null) {
      await createAlbum(parsed.data, media);
    } else {
      await updateAlbum(id, parsed.data, media);
    }

    revalidatePath(GALERI_PATH);
    if (id !== null) revalidatePath(`${GALERI_PATH}/${id}`);
    return successState(id === null ? "Album ditambahkan." : "Album diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus album beserta seluruh fotonya. */
export async function hapusAlbumAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data album tidak valid.");

  try {
    await deleteAlbum(id);
    revalidatePath(GALERI_PATH);
    return successState("Album dan seluruh fotonya dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Unggah beberapa foto sekaligus ke sebuah album. */
export async function unggahFotoAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const albumId = parseId(formData.get("albumId"));
  if (albumId === null) return errorState("Data album tidak valid.");

  const berkas = await ambilBanyakBerkas(formData, "foto");
  if (berkas.length === 0) return errorState("Pilih minimal satu foto untuk diunggah.");

  try {
    const hasil = await unggahFoto(albumId, berkas);
    revalidatePath(`${GALERI_PATH}/${albumId}`);
    revalidatePath(GALERI_PATH);

    if (hasil.tersimpan === 0) {
      const alasan = hasil.dilewati
        .slice(0, 3)
        .map((item) => `${item.nama} (${item.alasan})`)
        .join("; ");
      return errorState(`Tidak ada foto yang tersimpan. ${alasan}`);
    }

    const dilewati =
      hasil.dilewati.length === 0
        ? ""
        : ` ${hasil.dilewati.length} berkas dilewati: ${hasil.dilewati
            .slice(0, 3)
            .map((item) => `${item.nama} (${item.alasan})`)
            .join("; ")}`;

    return successState(`${hasil.tersimpan} foto diunggah.${dilewati}`);
  } catch (error) {
    return toErrorState(error);
  }
}

/** Perbarui metadata satu foto. */
export async function simpanFotoAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const albumId = parseId(formData.get("albumId"));
  if (id === null || albumId === null) return errorState("Data foto tidak valid.");

  const parsed = fotoFormSchema.safeParse({
    judul: text(formData, "judul"),
    keterangan: text(formData, "keterangan"),
    urut: text(formData, "urut"),
    aktif: formData.get("aktif") === "on",
    slider: formData.get("slider") === "on",
  });

  if (!parsed.success) {
    return errorState("Periksa kembali data foto.", zodToFieldErrors(parsed.error));
  }

  try {
    await updateFoto(id, parsed.data);
    revalidatePath(`${GALERI_PATH}/${albumId}`);
    return successState("Foto diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus satu foto. */
export async function hapusFotoAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  const albumId = parseId(formData.get("albumId"));
  if (id === null || albumId === null) return errorState("Data foto tidak valid.");

  try {
    await deleteFoto(id);
    revalidatePath(`${GALERI_PATH}/${albumId}`);
    revalidatePath(GALERI_PATH);
    return successState("Foto dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
