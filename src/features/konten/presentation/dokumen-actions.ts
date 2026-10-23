"use server";

import { revalidatePath } from "next/cache";

import { hapusDokumen, simpanDokumen } from "@/features/konten/application/dokumen-use-cases";
import { dokumenPublikFormSchema } from "@/features/konten/domain/dokumen";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

import { booleanValue, optionalText, parseId, text } from "./form-utils";

const PATH = "/konten/dokumen";

export async function saveDokumenAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = dokumenPublikFormSchema.safeParse({
    nama: text(formData, "nama"),
    slug: text(formData, "slug"),
    kategori: text(formData, "kategori") || "informasi_publik",
    jenis: text(formData, "jenis"),
    nomor: text(formData, "nomor"),
    keterangan: text(formData, "keterangan"),
    berkas: text(formData, "berkas"),
    tautan: text(formData, "tautan"),
    tahun: optionalText(formData, "tahun"),
    aktif: booleanValue(formData, "aktif"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali data dokumen.", zodToFieldErrors(parsed.error));
  }

  try {
    const id = parseId(formData.get("id"));
    await simpanDokumen(parsed.data, id);
    revalidatePath(PATH);
    revalidatePath("/desa/dokumen");
    return successState(
      id === undefined ? "Dokumen berhasil ditambahkan." : "Dokumen berhasil diubah.",
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteDokumenAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === undefined) return errorState("Dokumen yang akan dihapus tidak valid.");

  try {
    await hapusDokumen(id);
    revalidatePath(PATH);
    revalidatePath("/desa/dokumen");
    return successState("Dokumen berhasil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
