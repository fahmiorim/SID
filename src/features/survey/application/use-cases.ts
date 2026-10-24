import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { RESOURCES } from "@/features/rbac/domain/resources";
import {
  parsePilihanForm,
  rekapSoal,
  serializePilihan,
  validasiJawaban,
  type RekapSoal,
  type RespondenInput,
  type SoalInput,
  type SurveyInput,
} from "@/features/survey/domain/survey";
import {
  deleteResponden,
  deleteSoal,
  deleteSurvey,
  getResponden,
  getSoal,
  getSurvey,
  insertResponden,
  insertSoal,
  insertSurvey,
  listJawaban,
  listJawabanResponden,
  listResponden,
  listSoal,
  listSurvey,
  nextUrutanSoal,
  updateSoal,
  updateSurvey,
} from "@/features/survey/infrastructure/survey-repository";
import { requirePermission } from "@/lib/dal";
import { notFound, validationError } from "@/lib/errors";

/**
 * Use case analisis & survei.
 *
 * Izin diperiksa di sini. Tabel soal/responden tidak menyimpan `village_id`,
 * jadi setiap operasi anak diawali pemeriksaan bahwa survei induknya milik
 * desa sesi.
 */

/** Pastikan survei ada di desa ini; lempar 404 bila bukan. */
async function pastikanSurvei(villageId: number, surveyId: number) {
  const survei = await getSurvey(villageId, surveyId);
  if (!survei) throw notFound("Survei tidak ditemukan.");
  return survei;
}

/** Daftar seluruh survei desa (aktif maupun nonaktif). */
export async function listSurveyData() {
  const user = await requirePermission(RESOURCES.analisisSurvei, "read");
  const villageId = await resolveVillageId(user);
  return listSurvey(villageId);
}

/**
 * Detail survei: soal, responden, dan rekap per soal.
 *
 * Mengembalikan `null` bila survei bukan milik desa sesi, agar halaman dapat
 * memanggil `notFound()`.
 */
export async function getSurveyDetailData(surveyId: number) {
  const user = await requirePermission(RESOURCES.analisisSurvei, "read");
  const villageId = await resolveVillageId(user);

  const survei = await getSurvey(villageId, surveyId);
  if (!survei) return null;

  const [soal, responden, jawaban] = await Promise.all([
    listSoal(surveyId),
    listResponden(surveyId),
    listJawaban(surveyId),
  ]);

  const jawabanPerSoal = new Map<number, string[]>();
  for (const item of jawaban) {
    const list = jawabanPerSoal.get(item.soalId) ?? [];
    list.push(item.jawaban);
    jawabanPerSoal.set(item.soalId, list);
  }

  const rekap: RekapSoal[] = soal.map((item) => rekapSoal(item, jawabanPerSoal.get(item.id) ?? []));

  return {
    survei,
    soal,
    responden,
    rekap,
    urutanBerikutnya: await nextUrutanSoal(surveyId),
  };
}

/** Tambah/ubah survei. */
export async function simpanSurveyData(
  id: number | null,
  input: SurveyInput,
): Promise<{ id: number }> {
  const user = await requirePermission(RESOURCES.analisisSurvei, "update");
  const villageId = await resolveVillageId(user);

  const values = {
    judul: input.judul,
    deskripsi: input.deskripsi?.trim() ? input.deskripsi.trim() : null,
    aktif: input.aktif,
  };

  if (id === null) {
    const baru = await insertSurvey(villageId, values);
    return { id: baru };
  }

  await pastikanSurvei(villageId, id);
  await updateSurvey(villageId, id, values);
  return { id };
}

/** Hapus survei beserta soal, responden, dan jawabannya (cascade). */
export async function hapusSurveyData(id: number): Promise<void> {
  const user = await requirePermission(RESOURCES.analisisSurvei, "delete");
  const villageId = await resolveVillageId(user);

  await pastikanSurvei(villageId, id);
  await deleteSurvey(villageId, id);
}

/** Tambah/ubah soal pada survei. */
export async function simpanSoalData(
  id: number | null,
  input: SoalInput,
): Promise<{ id: number; surveyId: number }> {
  const user = await requirePermission(RESOURCES.analisisSurvei, "update");
  const villageId = await resolveVillageId(user);

  await pastikanSurvei(villageId, input.surveyId);

  if (id !== null) {
    const soal = await getSoal(input.surveyId, id);
    if (!soal) throw notFound("Pertanyaan tidak ditemukan.");
  }

  const pilihan = input.tipe === "choice" ? parsePilihanForm(input.pilihan ?? "") : [];

  const values = {
    pertanyaan: input.pertanyaan,
    tipe: input.tipe,
    pilihan: serializePilihan(pilihan),
    urutan: input.urutan,
  };

  if (id === null) {
    const baru = await insertSoal(input.surveyId, values);
    return { id: baru, surveyId: input.surveyId };
  }

  await updateSoal(input.surveyId, id, values);
  return { id, surveyId: input.surveyId };
}

/** Hapus soal (jawaban terkait ikut terhapus). */
export async function hapusSoalData(
  surveyId: number,
  soalId: number,
): Promise<{ surveyId: number }> {
  const user = await requirePermission(RESOURCES.analisisSurvei, "delete");
  const villageId = await resolveVillageId(user);

  await pastikanSurvei(villageId, surveyId);
  await deleteSoal(surveyId, soalId);
  return { surveyId };
}

/**
 * Simpan responden beserta jawabannya.
 *
 * Semua soal wajib dijawab. Jawaban pilihan harus salah satu opsi yang
 * tersimpan pada soal (bukan nilai kiriman klien), dan jawaban angka harus
 * berupa angka.
 */
export async function simpanRespondenData(
  input: RespondenInput,
  jawaban: Readonly<Record<string, string>>,
): Promise<{ id: number; surveyId: number }> {
  const user = await requirePermission(RESOURCES.analisisSurvei, "update");
  const villageId = await resolveVillageId(user);

  await pastikanSurvei(villageId, input.surveyId);

  const soal = await listSoal(input.surveyId);
  if (soal.length === 0) {
    throw validationError("Tambahkan pertanyaan sebelum mengisi responden.");
  }

  const errors = validasiJawaban(soal, jawaban);
  if (Object.keys(errors).length > 0) {
    throw validationError(
      "Lengkapi jawaban responden.",
      Object.fromEntries(
        Object.entries(errors).map(([soalId, pesan]) => [`jawaban.${soalId}`, [pesan]]),
      ),
    );
  }

  const id = await insertResponden(
    input.surveyId,
    { nama: input.nama, nik: input.nik },
    soal.map((item) => ({
      soalId: item.id,
      jawaban: (jawaban[String(item.id)] ?? "").trim(),
    })),
  );

  return { id, surveyId: input.surveyId };
}

/** Hapus responden beserta jawabannya. */
export async function hapusRespondenData(
  surveyId: number,
  respondenId: number,
): Promise<{ surveyId: number }> {
  const user = await requirePermission(RESOURCES.analisisSurvei, "delete");
  const villageId = await resolveVillageId(user);

  await pastikanSurvei(villageId, surveyId);
  await deleteResponden(surveyId, respondenId);
  return { surveyId };
}

/** Rincian jawaban satu responden untuk dialog. */
export async function getRespondenDetailData(surveyId: number, respondenId: number) {
  const user = await requirePermission(RESOURCES.analisisSurvei, "read");
  const villageId = await resolveVillageId(user);

  await pastikanSurvei(villageId, surveyId);

  const responden = await getResponden(surveyId, respondenId);
  if (!responden) throw notFound("Responden tidak ditemukan.");

  const [soal, jawaban] = await Promise.all([
    listSoal(surveyId),
    listJawabanResponden(surveyId, respondenId),
  ]);

  return {
    responden,
    jawaban: soal.map((item) => ({
      soalId: item.id,
      pertanyaan: item.pertanyaan,
      tipe: item.tipe,
      jawaban: jawaban.get(item.id) ?? "",
    })),
  };
}
