"use server";

import { revalidatePath } from "next/cache";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { simpanResponsPublikData } from "@/features/survey/application/use-cases";
import { respondenFormSchema } from "@/features/survey/domain/survey";
import {
  createIdleActionState,
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PATH_PUBLIK = "/desa/survei";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Kirim jawaban survei dari halaman publik.
 *
 * Desa ditentukan dari host permintaan; tidak ada `villageId` dari klien.
 * Honeypot `website` mengembalikan sukses palsu agar bot tidak mencoba lagi.
 */
export async function kirimSurveiPublikAction(
  _previousState: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  if (text(formData, "website") !== "") {
    return successState("Terima kasih, jawaban Anda sudah tercatat.", null);
  }

  const parsed = respondenFormSchema.safeParse({
    surveyId: text(formData, "surveyId"),
    nama: text(formData, "nama"),
    nik: text(formData, "nik"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian survei.", zodToFieldErrors(parsed.error));
  }

  const jawaban: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("jawaban.") && typeof value === "string") {
      jawaban[key.slice("jawaban.".length)] = value;
    }
  }

  try {
    const desa = await getIdentitasFromRequest();
    await simpanResponsPublikData(
      desa.id,
      parsed.data.surveyId,
      { nama: parsed.data.nama, nik: parsed.data.nik || null },
      jawaban,
    );
    revalidatePath(PATH_PUBLIK);

    return successState("Terima kasih, jawaban Anda sudah tercatat.", null);
  } catch (error) {
    return toErrorState(error);
  }
}

export { createIdleActionState };
