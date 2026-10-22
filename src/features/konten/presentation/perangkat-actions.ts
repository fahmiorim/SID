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
  createJabatan,
  createPerangkat,
  deleteJabatan,
  deletePerangkat,
  updateJabatan,
  updatePerangkat,
  type MediaPerangkat,
} from "../application/perangkat-use-cases";
import { jabatanFormSchema, perangkatFormSchema } from "../domain/perangkat";

const PERANGKAT_PATH = "/konten/perangkat";

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

/* -------------------------------------------------------------------------- */
/* Jabatan                                                                    */
/* -------------------------------------------------------------------------- */

/** Simpan jabatan (tambah bila `id` kosong, ubah bila ada). */
export async function simpanJabatanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = jabatanFormSchema.safeParse({
    nama: text(formData, "nama"),
    urut: text(formData, "urut"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian jabatan.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createJabatan(parsed.data);
    } else {
      await updateJabatan(id, parsed.data);
    }

    revalidatePath(PERANGKAT_PATH);
    return successState(id === null ? "Jabatan ditambahkan." : "Jabatan diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus jabatan; perangkat yang menjabatnya menjadi tanpa jabatan. */
export async function hapusJabatanAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data jabatan tidak valid.");

  try {
    await deleteJabatan(id);
    revalidatePath(PERANGKAT_PATH);
    return successState("Jabatan dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Perangkat                                                                  */
/* -------------------------------------------------------------------------- */

/** Simpan perangkat desa beserta foto baru (bila ada). */
export async function simpanPerangkatAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = perangkatFormSchema.safeParse({
    nama: text(formData, "nama"),
    jabatanId: text(formData, "jabatanId"),
    gelarDepan: text(formData, "gelarDepan"),
    gelarBelakang: text(formData, "gelarBelakang"),
    nip: text(formData, "nip"),
    nik: text(formData, "nik"),
    jenisKelamin: text(formData, "jenisKelamin"),
    tempatLahir: text(formData, "tempatLahir"),
    tanggalLahir: text(formData, "tanggalLahir"),
    penandaTangan: formData.get("penandaTangan") === "on",
    status: text(formData, "status"),
    urut: text(formData, "urut"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali data perangkat.", zodToFieldErrors(parsed.error));
  }

  const foto = await ambilBerkas(formData, "foto");
  if (foto && !foto.mime?.startsWith("image/")) {
    return errorState("Foto perangkat harus berupa gambar.", {
      foto: ["Pilih berkas gambar (JPG, PNG, WEBP, GIF, atau SVG)."],
    });
  }

  const media: MediaPerangkat = {};
  if (foto) media.foto = foto;

  try {
    if (id === null) {
      await createPerangkat(parsed.data, media);
    } else {
      await updatePerangkat(id, parsed.data, media);
    }

    revalidatePath(PERANGKAT_PATH);
    revalidatePath("/desa/pemerintahan");
    return successState(id === null ? "Perangkat ditambahkan." : "Perangkat diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus perangkat beserta fotonya. */
export async function hapusPerangkatAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data perangkat tidak valid.");

  try {
    await deletePerangkat(id);
    revalidatePath(PERANGKAT_PATH);
    revalidatePath("/desa/pemerintahan");
    return successState("Perangkat dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
