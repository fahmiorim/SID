"use server";

import { revalidatePath } from "next/cache";

import { simpanKonfigurasiTteData } from "@/features/surat/application/tte-use-cases";
import { konfigTteFormSchema, testKoneksi, type KonfigTte } from "@/features/surat/domain/tte";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const TTE_PATH = "/persuratan/tte";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function checkbox(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

export async function saveTteConfigAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = konfigTteFormSchema.safeParse({
    mode: text(formData, "mode"),
    api: text(formData, "api"),
    username: text(formData, "username"),
    nik: text(formData, "nik"),
    ssl: checkbox(formData, "ssl"),
    aktif: checkbox(formData, "aktif"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali konfigurasi TTE.", zodToFieldErrors(parsed.error));
  }

  try {
    await simpanKonfigurasiTteData(parsed.data);
    revalidatePath(TTE_PATH);
    return successState("Konfigurasi TTE disimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function testTteKoneksiAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = konfigTteFormSchema.safeParse({
    mode: text(formData, "mode"),
    api: text(formData, "api"),
    username: text(formData, "username"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali konfigurasi TTE.", zodToFieldErrors(parsed.error));
  }

  try {
    const config: KonfigTte = {
      mode: parsed.data.mode,
      api: parsed.data.api,
      username: parsed.data.username,
      nik: "",
      password: "",
      ssl: true,
      timeout: 30000,
    };

    const result = await testKoneksi(config);
    if (result.ok) {
      return successState(`Koneksi sukses: ${result.pesan}`);
    }
    return errorState(`Koneksi gagal: ${result.pesan}`);
  } catch (error) {
    return toErrorState(error);
  }
}
