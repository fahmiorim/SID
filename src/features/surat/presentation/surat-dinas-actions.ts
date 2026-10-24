"use server";

import { revalidatePath } from "next/cache";

import {
  createSuratDinasData,
  deleteSuratDinasData,
  updateSuratDinasData,
} from "@/features/surat/application/surat-dinas-use-cases";
import { suratDinasFormSchema } from "@/features/surat/domain/surat";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const SURAT_DINAS_PATH = "/persuratan/surat-dinas";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Baca berkas lampiran arsip dari FormData (bila pengguna memilih berkas). */
async function bacaBerkasArsip(formData: FormData): Promise<
  | {
      nama: string;
      mime: string | null;
      ukuran: number;
      isi: Uint8Array;
    }
  | undefined
> {
  const berkas = formData.get("arsipBerkas");
  if (!(berkas instanceof File) || berkas.size === 0) return undefined;

  return {
    nama: berkas.name,
    mime: berkas.type,
    ukuran: berkas.size,
    isi: new Uint8Array(await berkas.arrayBuffer()),
  };
}

export async function saveSuratDinasAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = suratDinasFormSchema.safeParse({
    letterNumber: text(formData, "letterNumber"),
    letterDate: text(formData, "letterDate"),
    recipient: text(formData, "recipient"),
    recipientAddress: text(formData, "recipientAddress"),
    subject: text(formData, "subject"),
    content: text(formData, "content"),
    classificationId: text(formData, "classificationId"),
    archiveFile: text(formData, "archiveFile"),
    hapusArsip: formData.get("hapusArsip") === "1",
    archiveLocation: text(formData, "archiveLocation"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    const berkas = await bacaBerkasArsip(formData);

    if (id === null) {
      await createSuratDinasData(parsed.data, berkas);
    } else {
      await updateSuratDinasData(id, parsed.data, berkas);
    }
    revalidatePath(SURAT_DINAS_PATH);
    return successState(id === null ? "Surat dinas dicatat." : "Surat dinas diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteSuratDinasAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data surat dinas tidak valid.");

  try {
    await deleteSuratDinasData(id);
    revalidatePath(SURAT_DINAS_PATH);
    return successState("Surat dinas dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
