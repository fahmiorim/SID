"use server";

import { revalidatePath } from "next/cache";

import {
  buatAkunWargaData,
  resetPinWargaData,
  ubahPinWargaData,
} from "@/features/warga/application/warga-use-cases";
import { ubahPinSchema, type KredensialWarga } from "@/features/warga/domain/warga";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseResidentId(formData: FormData): number | null {
  const value = Number(formData.get("residentId"));
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function buatAkunWargaAction(
  _previousState: ActionState<KredensialWarga | null>,
  formData: FormData,
): Promise<ActionState<KredensialWarga | null>> {
  const residentId = parseResidentId(formData);
  if (residentId === null) return errorState("Data penduduk tidak valid.");

  try {
    const kredensial = await buatAkunWargaData(residentId);
    revalidatePath("/penduduk");
    return successState(
      "Akun warga berhasil dibuat. Catat PIN sebelum menutup dialog.",
      kredensial,
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function resetPinWargaAction(
  _previousState: ActionState<KredensialWarga | null>,
  formData: FormData,
): Promise<ActionState<KredensialWarga | null>> {
  const residentId = parseResidentId(formData);
  if (residentId === null) return errorState("Data penduduk tidak valid.");

  try {
    const kredensial = await resetPinWargaData(residentId);
    revalidatePath("/penduduk");
    return successState(
      "PIN warga berhasil direset. Catat PIN baru sebelum menutup dialog.",
      kredensial,
    );
  } catch (error) {
    return toErrorState(error);
  }
}

export async function ubahPinWargaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ubahPinSchema.safeParse({
    pinLama: text(formData, "pinLama"),
    pinBaru: text(formData, "pinBaru"),
    konfirmasiPin: text(formData, "konfirmasiPin"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian PIN Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    await ubahPinWargaData(parsed.data);
    revalidatePath("/layanan-mandiri");
    return successState("PIN berhasil diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}
