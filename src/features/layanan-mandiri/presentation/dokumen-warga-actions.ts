"use server";

import { revalidatePath } from "next/cache";

import {
  hapusDokumenWargaData,
  ubahDokumenWargaData,
  unggahDokumenWargaData,
} from "@/features/layanan-mandiri/application/warga-use-cases";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    typeof (value as File).arrayBuffer === "function",
  );
}

async function bacaBerkas(formData: FormData): Promise<BerkasUnggahan | null> {
  const value = formData.get("berkas");
  if (!isFile(value) || value.size === 0) return null;

  return {
    nama: value.name,
    mime: value.type || null,
    ukuran: value.size,
    isi: new Uint8Array(await value.arrayBuffer()),
  };
}

export async function unggahDokumenWargaAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  try {
    await unggahDokumenWargaData({
      jenis: text(formData, "jenis"),
      nama: text(formData, "nama"),
      berkas: await bacaBerkas(formData),
    });
    revalidatePath("/layanan-mandiri/dokumen");
    return successState("Dokumen berhasil diunggah.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function ubahDokumenWargaAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return errorState("Dokumen tidak valid.");

  try {
    await ubahDokumenWargaData(id, {
      jenis: text(formData, "jenis"),
      nama: text(formData, "nama"),
    });
    revalidatePath("/layanan-mandiri/dokumen");
    return successState("Dokumen berhasil diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusDokumenWargaAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return errorState("Dokumen tidak valid.");

  try {
    await hapusDokumenWargaData(id);
    revalidatePath("/layanan-mandiri/dokumen");
    return successState("Dokumen berhasil dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
