"use server";

import { revalidatePath } from "next/cache";

import { ajukanSuratWargaData } from "@/features/layanan-mandiri/application/warga-use-cases";
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

async function bacaBerkas(formData: FormData, field: string): Promise<BerkasUnggahan | null> {
  const value = formData.get(field);
  if (!isFile(value) || value.size === 0) return null;

  return {
    nama: value.name,
    mime: value.type || null,
    ukuran: value.size,
    isi: new Uint8Array(await value.arrayBuffer()),
  };
}

export async function ajukanSuratWargaAction(
  _previousState: ActionState<{ id: number; noAntrian: string } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number; noAntrian: string } | null>> {
  const letterTypeId = Number(formData.get("letterTypeId"));
  if (!Number.isInteger(letterTypeId) || letterTypeId < 1) {
    return errorState("Jenis surat tidak valid.");
  }

  const isian: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("isian.") || typeof value !== "string") continue;
    isian[key.slice("isian.".length)] = value;
  }

  // Kolom berkas memakai nama `syarat.<id>` agar sejajar dengan peta kesalahan.
  const berkas = new Map<number, BerkasUnggahan>();
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("syarat.") || !isFile(value)) continue;
    const id = Number(key.slice("syarat.".length));
    if (!Number.isInteger(id) || id < 1) continue;
    const item = await bacaBerkas(formData, key);
    if (item) berkas.set(id, item);
  }

  try {
    const hasil = await ajukanSuratWargaData({
      letterTypeId,
      isian,
      noHpAktif: text(formData, "noHpAktif"),
      keterangan: text(formData, "keterangan"),
      berkas,
    });

    revalidatePath("/layanan-mandiri/surat");
    revalidatePath("/layanan-mandiri/beranda");
    revalidatePath("/layanan-mandiri/dokumen");
    revalidatePath("/layanan-mandiri/pesan");
    revalidatePath("/permohonan-surat");

    return successState(`Permohonan terkirim. Nomor antrian: ${hasil.noAntrian}.`, hasil);
  } catch (error) {
    return toErrorState(error);
  }
}
