"use server";

import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";

import {
  getAllMediaSettingsAction,
  resetMediaSettingsAction,
  saveMediaSettingsAction,
} from "../application/use-cases";
import {
  KATEGORI_LAMPIRAN,
  type KategoriLampiran,
  type MediaSettingsEfektif,
} from "../domain/pengaturan-berkas";

/** Ambil seluruh pengaturan lampiran. */
export async function loadMediaSettings(): Promise<MediaSettingsEfektif[]> {
  return getAllMediaSettingsAction();
}

/** Server action untuk menyimpan pengaturan per kategori. */
export async function saveMediaSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const kategori = formData.get("kategori") as KategoriLampiran;
    const rawMime = (formData.get("mimeAllowlist") as string)?.trim();
    const rawMaxFiles = formData.get("maxFiles") as string;
    const rawMaxSizeMb = formData.get("maxSizeMb") as string;

    if (!kategori || !KATEGORI_LAMPIRAN.includes(kategori as KategoriLampiran)) {
      return errorState("Kategori tidak valid.");
    }

    const mimeAllowlist = rawMime
      ? rawMime
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean)
      : null;

    const maxFiles = rawMaxFiles ? parseInt(rawMaxFiles, 10) : null;
    const maxSizeMb = rawMaxSizeMb ? parseFloat(rawMaxSizeMb) : null;

    await saveMediaSettingsAction({
      kategori,
      mimeAllowlist,
      maxFiles,
      maxSizeMb,
    });

    return successState(`Pengaturan "${kategori}" berhasil disimpan.`);
  } catch (error) {
    return toErrorState(error);
  }
}

/** Server action untuk reset pengaturan ke default. */
export async function resetMediaSettingsActionWrapped(
  kategori: KategoriLampiran,
): Promise<ActionState> {
  try {
    await resetMediaSettingsAction(kategori);
    return successState(`Pengaturan "${kategori}" berhasil dikembalikan ke default.`);
  } catch (error) {
    return toErrorState(error);
  }
}
