"use server";

import { revalidatePath } from "next/cache";

import {
  getRespondenDetailData,
  hapusRespondenData,
  hapusSoalData,
  hapusSurveyData,
  simpanRespondenData,
  simpanSoalData,
  simpanSurveyData,
} from "@/features/survey/application/use-cases";
import {
  respondenFormSchema,
  soalFormSchema,
  surveyFormSchema,
} from "@/features/survey/domain/survey";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PATH = "/analisis-survei";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseId(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function simpanSurveyAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = surveyFormSchema.safeParse({
    judul: text(formData, "judul"),
    deskripsi: text(formData, "deskripsi"),
    aktif: text(formData, "aktif"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian Anda.", zodToFieldErrors(parsed.error));
  }

  try {
    const hasil = await simpanSurveyData(id, parsed.data);
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${hasil.id}`);
    return successState(id === null ? "Survei dibuat." : "Survei diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusSurveyAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));
  if (id === null) return errorState("Data tidak valid.");

  try {
    await hapusSurveyData(id);
    revalidatePath(PATH);
    return successState("Survei dihapus beserta soal dan respondennya.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function simpanSoalAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = parseId(formData.get("id"));

  const parsed = soalFormSchema.safeParse({
    surveyId: text(formData, "surveyId"),
    pertanyaan: text(formData, "pertanyaan"),
    tipe: text(formData, "tipe"),
    pilihan: text(formData, "pilihan"),
    urutan: text(formData, "urutan"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali pertanyaan.", zodToFieldErrors(parsed.error));
  }

  try {
    const hasil = await simpanSoalData(id, parsed.data);
    revalidatePath(`${PATH}/${hasil.surveyId}`);
    return successState(id === null ? "Pertanyaan ditambahkan." : "Pertanyaan diperbarui.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusSoalAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const surveyId = parseId(formData.get("surveyId"));
  const id = parseId(formData.get("id"));
  if (surveyId === null || id === null) return errorState("Data tidak valid.");

  try {
    await hapusSoalData(surveyId, id);
    revalidatePath(`${PATH}/${surveyId}`);
    return successState("Pertanyaan dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function simpanRespondenAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jawaban: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("jawaban.") || typeof value !== "string") continue;
    jawaban[key.slice("jawaban.".length)] = value;
  }

  const parsed = respondenFormSchema.safeParse({
    surveyId: text(formData, "surveyId"),
    nama: text(formData, "nama"),
    nik: text(formData, "nik"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali data responden.", zodToFieldErrors(parsed.error));
  }

  try {
    const hasil = await simpanRespondenData(parsed.data, jawaban);
    revalidatePath(`${PATH}/${hasil.surveyId}`);
    revalidatePath(PATH);
    return successState("Responden dan jawabannya tersimpan.");
  } catch (error) {
    return toErrorState(error);
  }
}

export async function hapusRespondenAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const surveyId = parseId(formData.get("surveyId"));
  const id = parseId(formData.get("id"));
  if (surveyId === null || id === null) return errorState("Data tidak valid.");

  try {
    await hapusRespondenData(surveyId, id);
    revalidatePath(`${PATH}/${surveyId}`);
    revalidatePath(PATH);
    return successState("Responden dihapus.");
  } catch (error) {
    return toErrorState(error);
  }
}

/**
 * Muat jawaban satu responden untuk dialog rincian.
 *
 * Aksi baca seperti ini mengembalikan hasil bertipe, bukan `ActionState`
 * (lihat konvensi di ARCHITECTURE §5).
 */
export async function loadJawabanRespondenAction(surveyId: number, respondenId: number) {
  try {
    return { ok: true as const, data: await getRespondenDetailData(surveyId, respondenId) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memuat jawaban.";
    return { ok: false as const, message };
  }
}
