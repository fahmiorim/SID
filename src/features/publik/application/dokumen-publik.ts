import "server-only";

import {
  cariDokumenPublik,
  type CariDokumenPublikFilter,
} from "@/features/publik/infrastructure/content-repository";

/** Daftar dokumen publik tersaring; villageId wajib berasal dari host pemanggil. */
export async function daftarDokumenPublik(villageId: number, filter: CariDokumenPublikFilter) {
  return cariDokumenPublik(villageId, filter);
}
