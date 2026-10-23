import "server-only";

import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { survey, surveyResponden, surveySoal } from "@/db/schema";

export interface SurveiSoalPublik {
  id: number;
  pertanyaan: string;
  tipe: string;
}

export interface SurveiPublikRow {
  id: number;
  judul: string;
  deskripsi: string | null;
  jumlahSoal: number;
  jumlahResponden: number;
  soal: SurveiSoalPublik[];
}

/**
 * Survei aktif untuk situs publik.
 *
 * Tabel soal/responden tidak menyimpan `village_id`; scoping dilakukan lewat
 * join ke `survey.village_id` (daftar id survei sudah ter-scope lebih dulu).
 */
export async function listSurveiPublik(villageId: number): Promise<SurveiPublikRow[]> {
  const surveys = await db
    .select({
      id: survey.id,
      judul: survey.judul,
      deskripsi: survey.deskripsi,
      jumlahSoal: sql<number>`(
        select count(*) from ${surveySoal}
        where ${surveySoal.surveyId} = ${survey.id}
      )`,
      jumlahResponden: sql<number>`(
        select count(*) from ${surveyResponden}
        where ${surveyResponden.surveyId} = ${survey.id}
      )`,
    })
    .from(survey)
    .where(and(eq(survey.villageId, villageId), eq(survey.aktif, 1)))
    .orderBy(desc(survey.createdAt), desc(survey.id));

  if (surveys.length === 0) return [];

  const soalRows = await db
    .select({
      surveyId: surveySoal.surveyId,
      id: surveySoal.id,
      pertanyaan: surveySoal.pertanyaan,
      tipe: surveySoal.tipe,
      urutan: surveySoal.urutan,
    })
    .from(surveySoal)
    .where(
      inArray(
        surveySoal.surveyId,
        surveys.map((item) => item.id),
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
    });
    soalBySurvey.set(row.surveyId, list);
  }

  return surveys.map((row) => ({
    id: row.id,
    judul: row.judul,
    deskripsi: row.deskripsi,
    jumlahSoal: Number(row.jumlahSoal ?? 0),
    jumlahResponden: Number(row.jumlahResponden ?? 0),
    soal: soalBySurvey.get(row.id) ?? [],
  }));
}

/** Banyaknya survei aktif; dipakai kartu ringkas bila diperlukan. */
export async function countSurveiAktif(villageId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(survey)
    .where(and(eq(survey.villageId, villageId), eq(survey.aktif, 1)));

  return row?.value ?? 0;
}
