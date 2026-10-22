"use server";

import { daftarDokumen } from "@/features/konten/application/dokumen-use-cases";
import type { DokumenRingkas } from "@/features/publik/infrastructure/content-repository";

export async function daftarDokumenAction(
  _previousState: unknown,
  _formData: FormData,
): Promise<{ success: boolean; dokumen: DokumenRingkas[] | null; error?: string }> {
  try {
    const dokumen = await daftarDokumen();
    return { success: true, dokumen };
  } catch (error) {
    return {
      success: false,
      dokumen: null,
      error: (error as Error).message || "Gagal memuat dokumen.",
    };
  }
}
