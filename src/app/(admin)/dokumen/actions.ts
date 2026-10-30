"use server";

import { revalidatePath } from "next/cache";

import { hapusDokumen, simpanDokumen } from "@/features/konten/application/dokumen-use-cases";
import {
  dokumenPublikFormSchema,
  type DokumenPublikFormInput,
} from "@/features/konten/domain/dokumen";
import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";

export async function saveDokumenAction(
  _previousState: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  const raw: DokumenPublikFormInput = {
    nama: formData.get("nama")?.toString().trim() ?? "",
    slug: formData.get("slug")?.toString().trim() ?? "",
    kategori:
      (formData.get("kategori") as "informasi_publik" | "produk_hukum" | "lainnya") ??
      "informasi_publik",
    jenis: formData.get("jenis")?.toString().trim() ?? "",
    nomor: formData.get("nomor")?.toString().trim() ?? "",
    tahun: formData.get("tahun") ? Number(formData.get("tahun")) : undefined,
    berkas: formData.get("berkas")?.toString().trim() ?? "",
    tautan: formData.get("tautan")?.toString().trim() ?? "",
    keterangan: formData.get("keterangan")?.toString().trim() ?? "",
    aktif: formData.get("aktif") === "on",
  };

  const parsed = dokumenPublikFormSchema.safeParse(raw);
  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  const id = formData.get("id") ? Number(formData.get("id")) : undefined;

  try {
    await simpanDokumen(parsed.data, id);
    revalidatePath("/konten/dokumen");
    return successState(id ? "Dokumen diperbarui." : "Dokumen ditambahkan.");
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Gagal menyimpan dokumen.");
  }
}

export async function deleteDokumenAction(
  _previousState: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  const id = Number(formData.get("id"));
  if (!id) {
    return errorState("ID dokumen tidak valid.");
  }

  try {
    await hapusDokumen(id);
    revalidatePath("/konten/dokumen");
    return successState("Dokumen dihapus.");
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Gagal menghapus dokumen.");
  }
}
