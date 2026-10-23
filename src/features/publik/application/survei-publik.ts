import "server-only";

import {
  listSurveiPublik as listSurveiRows,
  type SurveiPublikRow,
} from "@/features/publik/infrastructure/survey-repository";

export type SurveiPublik = SurveiPublikRow;

/** Survei aktif beserta soal dan jumlah responden untuk halaman publik. */
export async function listSurveiPublik(villageId: number): Promise<SurveiPublik[]> {
  return listSurveiRows(villageId);
}
