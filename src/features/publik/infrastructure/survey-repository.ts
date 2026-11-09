import "server-only";

import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { survey, surveyJawaban, surveyResponden, surveySoal } from "@/db/schema";
import { parsePilihanSoal } from "@/features/survey/domain/survey";

export interface SurveiSoalPublik {
  id: number;
  pertanyaan: string;
  tipe: string;
  pilihan: string[];
}

export interface SurveiPublikRow {
  id: number;
  judul: string;
  deskripsi: string | null;
  sasaran: string | null;
  mulai: string | null;
  selesai: string | null;
  jumlahSoal: number;
  jumlahResponden: number;
  soal: SurveiSoalPublik[];
}

/**
 * Survei aktif untuk situs publik, dibatasi periode pengisian bila diisi.
 *
 * Tabel soal/responden tidak menyimpan `village_id`; scoping dilakukan lewat
 * join ke `survey.village_id` (daftar id survei sudah ter-scope lebih dulu).
 */
export async function listSurveiPublik(villageId: number): Promise<SurveiPublikRow[]> {
  const hariIni = new Date().toISOString().slice(0, 10);

  const surveys = await db
    .select({
      id: survey.id,
      judul: survey.judul,
      deskripsi: survey.deskripsi,
      sasaran: survey.sasaran,
      mulai: survey.mulai,
      selesai: survey.selesai,
    })
    .from(survey)
    .where(and(eq(survey.villageId, villageId), eq(survey.aktif, 1)))
    .orderBy(desc(survey.createdAt), desc(survey.id));

  const tersedia = surveys.filter(
    (item) =>
      (item.mulai === null || item.mulai <= hariIni) &&
      (item.selesai === null || item.selesai >= hariIni),
  );

  if (tersedia.length === 0) return [];

  const soalRows = await db
    .select({
      surveyId: surveySoal.surveyId,
      id: surveySoal.id,
      pertanyaan: surveySoal.pertanyaan,
      tipe: surveySoal.tipe,
      pilihan: surveySoal.pilihan,
      urutan: surveySoal.urutan,
    })
    .from(surveySoal)
    .where(
      inArray(
        surveySoal.surveyId,
        tersedia.map((item) => item.id),
      ),
    )
    .orderBy(asc(surveySoal.urutan), asc(surveySoal.id));

  const soalBySurvey = new Map<number, SurveiSoalPublik[]>();
  for (const row of soalRows) {
    const list = soalBySurvey.get(row.surveyId) ?? [];
    list.push({
      id: row.id,
      pertanyaan: row.pertanyaan,
      tipe: row.tipe ?? "text",
      pilihan: parsePilihanSoal(row.pilihan),
    });
    soalBySurvey.set(row.surveyId, list);
  }

  // Hitungan diambil lewat query agregat, bukan subquery berkorelasi: Drizzle
  // merender nama kolom tanpa kualifikasi, sehingga `id` di dalam subquery
  // menunjuk kolom tabel dalam (mis. `survey_soal.id`), bukan `survey.id`.
  const respondenRows = await db
    .select({ surveyId: surveyResponden.surveyId, jumlah: count() })
    .from(surveyResponden)
    .where(
      inArray(
        surveyResponden.surveyId,
        tersedia.map((item) => item.id),
      ),
    )
    .groupBy(surveyResponden.surveyId);
  const respondenBySurvey = new Map(
    respondenRows.map((row) => [row.surveyId, Number(row.jumlah ?? 0)]),
  );

  return tersedia.map((row) => ({
    id: row.id,
    judul: row.judul,
    deskripsi: row.deskripsi,
    sasaran: row.sasaran,
    mulai: row.mulai,
    selesai: row.selesai,
    jumlahSoal: soalBySurvey.get(row.id)?.length ?? 0,
    jumlahResponden: respondenBySurvey.get(row.id) ?? 0,
    soal: soalBySurvey.get(row.id) ?? [],
  }));
}

export interface JawabanPublikRow {
  surveyId: number;
  respondenId: number;
  soalId: number;
  jawaban: string;
}

/**
 * Jawaban survei desa untuk rekap publik, opsional dibatasi tahun responden.
 *
 * Tidak ada kolom identitas yang dipilih: rekap publik hanya butuh agregat,
 * sehingga nama/NIK tidak pernah meninggalkan basis data.
 */
export async function listJawabanPublik(
  villageId: number,
  filter: { tahun?: number } = {},
): Promise<JawabanPublikRow[]> {
  const rows = await db
    .select({
      surveyId: surveySoal.surveyId,
      respondenId: surveyJawaban.respondenId,
      soalId: surveyJawaban.soalId,
      jawaban: surveyJawaban.jawaban,
    })
    .from(surveyJawaban)
    .innerJoin(surveyResponden, eq(surveyJawaban.respondenId, surveyResponden.id))
    .innerJoin(surveySoal, eq(surveyJawaban.soalId, surveySoal.id))
    .innerJoin(survey, eq(surveySoal.surveyId, survey.id))
    .where(
      and(
        eq(survey.villageId, villageId),
        filter.tahun === undefined
          ? undefined
          : sql`year(${surveyResponden.createdAt}) = ${filter.tahun}`,
      ),
    );

  return rows.map((row) => ({
    surveyId: row.surveyId,
    respondenId: row.respondenId,
    soalId: row.soalId,
    jawaban: row.jawaban ?? "",
  }));
}

/** Daftar tahun yang punya responden, terbaru lebih dulu. */
export async function listTahunRespondenPublik(villageId: number): Promise<number[]> {
  const tahun = sql<number>`year(${surveyResponden.createdAt})`;
  const rows = await db
    .select({ tahun })
    .from(surveyResponden)
    .innerJoin(survey, eq(surveyResponden.surveyId, survey.id))
    .where(eq(survey.villageId, villageId))
    .groupBy(tahun)
    .orderBy(desc(tahun));

  return rows
    .map((row) => Number(row.tahun))
    .filter((value) => Number.isInteger(value) && value >= 1900 && value <= 2100);
}

/** Banyaknya survei aktif; dipakai kartu ringkas bila diperlukan. */
export async function countSurveiAktif(villageId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(survey)
    .where(and(eq(survey.villageId, villageId), eq(survey.aktif, 1)));

  return row?.value ?? 0;
}
