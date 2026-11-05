import "server-only";

import {
  listPeriodeSurveiPublik as listPeriodeRows,
  listSurveiPublik as listSurveiRows,
  type SurveiPublikRow,
} from "@/features/publik/infrastructure/survey-repository";

export type SurveiPublik = SurveiPublikRow;

/**
 * Survei aktif beserta rekap agregat jawaban untuk halaman publik.
 *
 * `periode` (tahun) menyaring respons yang dihitung; `null` berarti seluruh
 * periode. Hanya hitungan yang dikembalikan — tanpa nama, NIK, atau isi teks.
 */
export async function listSurveiPublik(
  villageId: number,
  periode: number | null = null,
): Promise<SurveiPublik[]> {
  return listSurveiRows(villageId, periode);
}

/** Tahun yang memiliki respons survei aktif, untuk pilihan filter periode. */
export async function listPeriodeSurveiPublik(villageId: number): Promise<number[]> {
  return listPeriodeRows(villageId);
}
