"use server";

import { revalidatePath } from "next/cache";

import {
  createWilayah,
  deleteWilayah,
  updateWilayah,
} from "@/features/wilayah/application/use-cases";
import { wilayahFormSchema } from "@/features/wilayah/domain/wilayah";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const WILAYAH_PATH = "/wilayah";

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/**
 * Simpan wilayah (tambah bila `id` kosong, ubah bila ada).
 *
 * Izin & validasi ditegakkan di server (use case + Zod); UI hanya menyajikan.
 */
export async function saveWilayahAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = wilayahFormSchema.safeParse({
    dusun: formData.get("dusun"),
    rw: formData.get("rw") ?? "",
    rt: formData.get("rt") ?? "",
    urut: formData.get("urut") ?? 0,
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    if (id === null) {
      await createWilayah(parsed.data);
    } else {
      await updateWilayah(id, parsed.data);
    }

    revalidatePath(WILAYAH_PATH);
    return successState(id === null ? "Data wilayah ditambahkan." : "Data wilayah diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

/** Hapus wilayah berdasarkan `id`. */
export async function deleteWilayahAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  if (id === null) {
    return errorState("Data wilayah tidak valid.");
  }

  try {
    await deleteWilayah(id);
    revalidatePath(WILAYAH_PATH);
    return successState("Data wilayah dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}
