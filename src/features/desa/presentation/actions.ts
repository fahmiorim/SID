"use server";

import { revalidatePath } from "next/cache";

import { updateIdentitas } from "@/features/desa/application/use-cases";
import { desaFormSchema } from "@/features/desa/domain/desa";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const IDENTITAS_PATH = "/pengaturan/desa";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveIdentitasDesaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = desaFormSchema.safeParse({
    namaDesa: text(formData, "namaDesa"),
    kodeDesa: text(formData, "kodeDesa"),
    kodePos: text(formData, "kodePos"),
    namaKecamatan: text(formData, "namaKecamatan"),
    kodeKecamatan: text(formData, "kodeKecamatan"),
    namaKabupaten: text(formData, "namaKabupaten"),
    kodeKabupaten: text(formData, "kodeKabupaten"),
    namaPropinsi: text(formData, "namaPropinsi"),
    kodePropinsi: text(formData, "kodePropinsi"),
    alamatKantor: text(formData, "alamatKantor"),
    emailDesa: text(formData, "emailDesa"),
    telepon: text(formData, "telepon"),
    website: text(formData, "website"),
    logo: text(formData, "logo"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    await updateIdentitas(parsed.data);
    revalidatePath(IDENTITAS_PATH);
    revalidatePath("/beranda");
    return successState("Identitas desa diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}
