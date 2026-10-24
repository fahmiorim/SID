"use server";

import { revalidatePath } from "next/cache";

import {
  getRespondenDetailData,
  hapusRespondenData,
  hapusSoalData,
  hapusSurveyData,
  importSurveyCsvData,
  simpanRespondenData,
  simpanSoalData,
  simpanSurveyData,
  type HasilImporSurvei,
} from "@/features/survey/application/use-cases";
import {
  respondenFormSchema,
  soalFormSchema,
  surveyFormSchema,
} from "@/features/survey/domain/survey";
import { MAKS_UKURAN_CSV } from "@/features/survey/domain/survey-csv";
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
 * Impor respons survei dari berkas CSV.
 *
 * Berkas dibaca di server lalu divalidasi per baris; tanggapan berisi jumlah
 * yang diimpor dan rincian baris yang ditolak agar operator bisa memperbaiki.
 */
export async function imporRespondenAction(
  _previousState: ActionState<HasilImporSurvei | null>,
  formData: FormData,
): Promise<ActionState<HasilImporSurvei | null>> {
  const surveyId = parseId(formData.get("surveyId"));
  if (surveyId === null) return errorState("Survei tidak valid.");

  const berkas = formData.get("berkas");
  if (!(berkas instanceof File) || berkas.size === 0) {
    return errorState("Pilih berkas CSV yang akan diimpor.");
  }
  if (berkas.size > MAKS_UKURAN_CSV) {
    return errorState("Berkas terlalu besar (maksimal 2 MB).");
  }

  const nama = berkas.name.toLowerCase();
  if (!nama.endsWith(".csv") && !nama.endsWith(".txt")) {
    return errorState("Berkas harus berformat .csv.");
  }

  try {
    const hasil = await importSurveyCsvData(surveyId, await berkas.text());
    revalidatePath(`${PATH}/${surveyId}`);
    revalidatePath(PATH);

    if (hasil.diimpor === 0) {
      return successState(`Tidak ada baris yang diimpor; ${hasil.ditolak} baris ditolak.`, hasil);
    }

    const pesan = `${hasil.diimpor} responden diimpor${
      hasil.ditolak > 0 ? `, ${hasil.ditolak} baris ditolak` : ""
    }.`;
    return successState(pesan, hasil);
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
