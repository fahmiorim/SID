"use server";

import { daftarWidget } from "@/features/konten/application/widget-use-cases";

export async function daftarWidgetAction(
  _previousState: unknown,
  _formData: FormData,
): Promise<{ success: boolean; widgets?: unknown; error?: string }> {
  try {
    const widgets = await daftarWidget();
    return { success: true, widgets };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message || "Gagal memuat widget." };
  }
}
