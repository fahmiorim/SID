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
  createBerita,
  createKategori,
  deleteBerita,
  deleteKategori,
  updateBerita,
  updateKategori,
  type MediaBerita,
} from "../application/berita-use-cases";
import { beritaFormSchema, kategoriBeritaFormSchema } from "../domain/berita";

const BERITA_PATH = "/konten/berita";
const KATEGORI_PATH = "/konten/berita/kategori";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Baca berkas dari `FormData` menjadi bentuk yang dipakai use case. */
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

/** Simpan berita (tambah bila `id` kosong, ubah bila ada) beserta media baru. */
export async function simpanBeritaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = beritaFormSchema.safeParse({
    judul: text(formData, "judul"),
    kategoriId: text(formData, "kategoriId"),
    ringkasan: text(formData, "ringkasan"),
    isi: text(formData, "isi"),
    status: text(formData, "status"),
    terbitPada: text(formData, "terbitPada"),
    headline: formData.get("headline") === "on",
    slider: formData.get("slider") === "on",
    bolehKomentar: formData.get("bolehKomentar") === "on",
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian berita.", zodToFieldErrors(parsed.error));
  }

  const gambar = await ambilBerkas(formData, "gambar");
  const dokumen = await ambilBerkas(formData, "dokumen");

  if (gambar && !gambar.mime?.startsWith("image/")) {
    return errorState("Sampul berita harus berupa gambar.", {
      gambar: ["Pilih berkas gambar (JPG, PNG, WEBP, GIF, atau SVG)."],
    });
  }

  if (dokumen && dokumen.mime !== "application/pdf") {
    return errorState("Lampiran berita harus berupa PDF.", {
      dokumen: ["Pilih berkas PDF."],
    });
  }

  const media: MediaBerita = {};
  if (gambar) media.gambar = gambar;
  if (dokumen) media.dokumen = dokumen;

  try {
    if (id === null) {
      await createBerita(parsed.data, media);
    } else {
      await updateBerita(id, parsed.data, media);
    }

    revalidatePath(BERITA_PATH);
    return successState(id === null ? "Berita ditambahkan." : "Berita diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus berita beserta media yang dirujuknya. */
export async function hapusBeritaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data berita tidak valid.");

  try {
    await deleteBerita(id);
    revalidatePath(BERITA_PATH);
    return successState("Berita dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Simpan kategori berita (tambah/ubah). */
export async function simpanKategoriAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = kategoriBeritaFormSchema.safeParse({
    nama: text(formData, "nama"),
    urut: text(formData, "urut"),
    aktif: formData.get("aktif") === "on",
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian kategori.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createKategori(parsed.data);
    } else {
      await updateKategori(id, parsed.data);
    }

    revalidatePath(KATEGORI_PATH);
    revalidatePath(BERITA_PATH);
    return successState(id === null ? "Kategori ditambahkan." : "Kategori diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus kategori; berita yang memakainya menjadi tanpa kategori. */
export async function hapusKategoriAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data kategori tidak valid.");

  try {
    await deleteKategori(id);
    revalidatePath(KATEGORI_PATH);
    revalidatePath(BERITA_PATH);
    return successState("Kategori dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
