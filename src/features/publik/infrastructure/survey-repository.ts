import "server-only";

import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { survey, surveyJawaban, surveyResponden, surveySoal } from "@/db/schema";
import {
  susunRekapSurvei,
  type AgregatSurvei,
  type RekapSoalPublik,
} from "@/features/publik/domain/rekap-survei";
import { normalizeTipeSoal, parsePilihanSoal } from "@/features/survey/domain/survey";

export type SurveiSoalPublik = RekapSoalPublik;

export interface SurveiPublikRow {
  id: number;
  judul: string;
  deskripsi: string | null;
  sasaran: string | null;
  mulai: string | null;
  selesai: string | null;
  /** Apakah pengisian survei masih dibuka hari ini. */
  bisaDiisi: boolean;
  jumlahSoal: number;
  jumlahResponden: number;
  soal: RekapSoalPublik[];
}

/** Filter tahun pembuatan respons; `null` berarti semua periode. */
function filterPeriode(periode: number | null) {
  return periode === null ? undefined : sql`year(${surveyResponden.createdAt}) = ${periode}`;
}

/** Ubah nilai agregat SQL (string desimal/angka) menjadi angka aman. */
function keAngka(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const angka = Number(value);
  return Number.isFinite(angka) ? Math.round(angka * 100) / 100 : null;
}

/** Tambahkan agregat kosong untuk satu survei bila belum ada. */
function agregatSurvei(peta: Map<number, AgregatSurvei>, surveyId: number): AgregatSurvei {
  const ada = peta.get(surveyId);
  if (ada) return ada;

  const baru: AgregatSurvei = { pilihan: [], angka: [], teks: [] };
  peta.set(surveyId, baru);
  return baru;
}

/**
 * Survei aktif untuk situs publik, beserta rekap agregat jawabannya.
 *
 * - Tabel soal/responden tidak menyimpan `village_id`; scoping dilakukan lewat
 *   join ke `survey.village_id` (daftar id survei sudah ter-scope lebih dulu).
 * - `periode` menyaring respons menurut tahun `survey_responden.created_at`.
 * - Rekap hanya berisi hitungan. Jawaban mentah (dan isian teks) tidak pernah
 *   dikembalikan agar data pribadi tidak masuk ke halaman publik.
 * - Survei tetap ditampilkan walau periode pengisiannya sudah lewat supaya
 *   hasil pendataan dapat dibaca publik; `bisaDiisi` menandai yang masih buka.
 */
export async function listSurveiPublik(
  villageId: number,
  periode: number | null = null,
): Promise<SurveiPublikRow[]> {
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

  if (surveys.length === 0) return [];

  const ids = surveys.map((item) => item.id);

  const [soalRows, respondenRows, pilihanRows, angkaRows, teksRows] = await Promise.all([
    db
      .select({
        surveyId: surveySoal.surveyId,
        id: surveySoal.id,
        pertanyaan: surveySoal.pertanyaan,
        tipe: surveySoal.tipe,
        pilihan: surveySoal.pilihan,
        urutan: surveySoal.urutan,
      })
      .from(surveySoal)
      .where(inArray(surveySoal.surveyId, ids))
      .orderBy(asc(surveySoal.urutan), asc(surveySoal.id)),
    db
      .select({ surveyId: surveyResponden.surveyId, jumlah: count() })
      .from(surveyResponden)
      .where(and(inArray(surveyResponden.surveyId, ids), filterPeriode(periode)))
      .groupBy(surveyResponden.surveyId),
    db
      .select({
        soalId: surveyJawaban.soalId,
        label: surveyJawaban.jawaban,
        jumlah: count(),
      })
      .from(surveyJawaban)
      .innerJoin(surveySoal, eq(surveyJawaban.soalId, surveySoal.id))
      .innerJoin(surveyResponden, eq(surveyJawaban.respondenId, surveyResponden.id))
      .where(
        and(
          inArray(surveySoal.surveyId, ids),
          eq(surveySoal.tipe, "choice"),
          filterPeriode(periode),
        ),
      )
      .groupBy(surveyJawaban.soalId, surveyJawaban.jawaban),
    db
      .select({
        soalId: surveyJawaban.soalId,
        dijawab: count(),
        rataRata: sql<string | null>`avg(cast(${surveyJawaban.jawaban} as decimal(14,2)))`,
        terkecil: sql<string | null>`min(cast(${surveyJawaban.jawaban} as decimal(14,2)))`,
        terbesar: sql<string | null>`max(cast(${surveyJawaban.jawaban} as decimal(14,2)))`,
      })
      .from(surveyJawaban)
      .innerJoin(surveySoal, eq(surveyJawaban.soalId, surveySoal.id))
      .innerJoin(surveyResponden, eq(surveyJawaban.respondenId, surveyResponden.id))
      .where(
        and(
          inArray(surveySoal.surveyId, ids),
          eq(surveySoal.tipe, "number"),
          filterPeriode(periode),
        ),
      )
      .groupBy(surveyJawaban.soalId),
    db
      .select({ soalId: surveyJawaban.soalId, dijawab: count() })
      .from(surveyJawaban)
      .innerJoin(surveySoal, eq(surveyJawaban.soalId, surveySoal.id))
      .innerJoin(surveyResponden, eq(surveyJawaban.respondenId, surveyResponden.id))
      .where(
        and(inArray(surveySoal.surveyId, ids), eq(surveySoal.tipe, "text"), filterPeriode(periode)),
      )
      .groupBy(surveyJawaban.soalId),
  ]);

  const soalBySurvey = new Map<number, RekapSoalPublik[]>();
  const soalRingkasBySurvey = new Map<
    number,
    { id: number; pertanyaan: string; tipe: string; pilihan: string[] }[]
  >();
  const surveyOfSoal = new Map<number, number>();

  for (const row of soalRows) {
    const ringkas = {
      id: row.id,
      pertanyaan: row.pertanyaan,
      tipe: normalizeTipeSoal(row.tipe),
      pilihan: parsePilihanSoal(row.pilihan),
    };
    const list = soalRingkasBySurvey.get(row.surveyId) ?? [];
    list.push(ringkas);
    soalRingkasBySurvey.set(row.surveyId, list);
    surveyOfSoal.set(row.id, row.surveyId);
  }

  const agregatPerSurvey = new Map<number, AgregatSurvei>();

  for (const row of pilihanRows) {
    const surveyId = surveyOfSoal.get(row.soalId);
    if (surveyId === undefined) continue;
    agregatSurvei(agregatPerSurvey, surveyId).pilihan.push({
      soalId: row.soalId,
      label: row.label ?? "",
      jumlah: Number(row.jumlah ?? 0),
    });
  }

  for (const row of angkaRows) {
    const surveyId = surveyOfSoal.get(row.soalId);
    if (surveyId === undefined) continue;
    agregatSurvei(agregatPerSurvey, surveyId).angka.push({
      soalId: row.soalId,
      dijawab: Number(row.dijawab ?? 0),
      rataRata: keAngka(row.rataRata),
      terkecil: keAngka(row.terkecil),
      terbesar: keAngka(row.terbesar),
    });
  }

  for (const row of teksRows) {
    const surveyId = surveyOfSoal.get(row.soalId);
    if (surveyId === undefined) continue;
    agregatSurvei(agregatPerSurvey, surveyId).teks.push({
      soalId: row.soalId,
      dijawab: Number(row.dijawab ?? 0),
    });
  }

  const respondenPerSurvey = new Map(
    respondenRows.map((row) => [row.surveyId, Number(row.jumlah ?? 0)]),
  );

  for (const [surveyId, list] of soalRingkasBySurvey) {
    soalBySurvey.set(
      surveyId,
      susunRekapSurvei(
        list,
        agregatPerSurvey.get(surveyId) ?? { pilihan: [], angka: [], teks: [] },
      ),
    );
  }

  return surveys.map((row) => {
    const bisaDiisi =
      (row.mulai === null || row.mulai <= hariIni) &&
      (row.selesai === null || row.selesai >= hariIni);
    const soal = soalBySurvey.get(row.id) ?? [];

    return {
      id: row.id,
      judul: row.judul,
      deskripsi: row.deskripsi,
      sasaran: row.sasaran,
      mulai: row.mulai,
      selesai: row.selesai,
      bisaDiisi,
      jumlahSoal: soal.length,
      jumlahResponden: respondenPerSurvey.get(row.id) ?? 0,
      soal,
    };
  });
}

/** Tahun-tahun yang memiliki respons survei aktif desa ini (terbaru dulu). */
export async function listPeriodeSurveiPublik(villageId: number): Promise<number[]> {
  const rows = await db
    .select({ tahun: sql<number>`year(${surveyResponden.createdAt})` })
    .from(surveyResponden)
    .innerJoin(survey, eq(surveyResponden.surveyId, survey.id))
    .where(and(eq(survey.villageId, villageId), eq(survey.aktif, 1)))
    .groupBy(sql`year(${surveyResponden.createdAt})`)
    .orderBy(sql`year(${surveyResponden.createdAt}) desc`);

  return rows
    .map((row) => Number(row.tahun))
    .filter((tahun) => Number.isInteger(tahun) && tahun >= 1900 && tahun <= 2100);
}

/** Banyaknya survei aktif; dipakai kartu ringkas bila diperlukan. */
export async function countSurveiAktif(villageId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(survey)
    .where(and(eq(survey.villageId, villageId), eq(survey.aktif, 1)));

  return row?.value ?? 0;
}
