import "server-only";

import {
  listJawabanPublik,
  listSurveiPublik as listSurveiRows,
  listTahunRespondenPublik,
  type SurveiPublikRow,
} from "@/features/publik/infrastructure/survey-repository";

import { rekapHasilSurvei, type HasilSoalSurvei } from "../domain/hasil-survei";

export type SurveiPublik = SurveiPublikRow;

/** Survei aktif beserta soal dan jumlah responden untuk halaman publik. */
export async function listSurveiPublik(villageId: number): Promise<SurveiPublik[]> {
  return listSurveiRows(villageId);
}

export interface HasilSurveiPublik {
  surveiId: number;
  judul: string;
  /** Responden unik yang dihitung pada periode terpilih. */
  jumlahResponden: number;
  soal: HasilSoalSurvei[];
}

export interface RekapHasilSurveiPublik {
  tahun: number | null;
  tahunTersedia: number[];
  survei: HasilSurveiPublik[];
}

/**
 * Rekap agregat hasil pendataan untuk situs publik (OS-WEB-013).
 *
 * Data pribadi tidak pernah diambil dari basis data; hanya jawaban yang
 * diagregasi per soal. `villageId` wajib berasal dari host, bukan input klien.
 */
export async function getHasilSurveiPublik(
  villageId: number,
  filter: { tahun?: number } = {},
): Promise<RekapHasilSurveiPublik> {
  const [survei, jawaban, tahunTersedia] = await Promise.all([
    listSurveiRows(villageId),
    listJawabanPublik(villageId, filter),
    listTahunRespondenPublik(villageId),
  ]);

  const perSurvei = new Map<number, { responden: Set<number>; jawaban: typeof jawaban }>();
  for (const item of jawaban) {
    const masuk = perSurvei.get(item.surveyId) ?? { responden: new Set<number>(), jawaban: [] };
    masuk.responden.add(item.respondenId);
    masuk.jawaban.push(item);
    perSurvei.set(item.surveyId, masuk);
  }

  return {
    tahun: filter.tahun ?? null,
    tahunTersedia,
    survei: survei.map((item) => {
      const masuk = perSurvei.get(item.id);
      return {
        surveiId: item.id,
        judul: item.judul,
        jumlahResponden: masuk?.responden.size ?? 0,
        soal: rekapHasilSurvei(item.soal, masuk?.jawaban ?? []),
      };
    }),
  };
}
