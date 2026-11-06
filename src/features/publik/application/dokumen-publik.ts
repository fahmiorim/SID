import "server-only";

import { susunArsipDokumen, type KelompokArsipDokumen } from "@/features/publik/domain/dokumen";
import {
  cariDokumenPublik,
  listArsipDokumen,
  type CariDokumenPublikFilter,
} from "@/features/publik/infrastructure/content-repository";

export interface DokumenPublikHasil {
  rows: Awaited<ReturnType<typeof cariDokumenPublik>>["rows"];
  total: number;
  page: number;
  pageSize: number;
  /** Arsip dokumen aktif per tahun & jenis (OS-WEB-005). */
  arsip: KelompokArsipDokumen[];
}

/** Daftar dokumen publik tersaring; villageId wajib berasal dari host pemanggil. */
export async function daftarDokumenPublik(
  villageId: number,
  filter: CariDokumenPublikFilter,
): Promise<DokumenPublikHasil> {
  const [halaman, arsipRows] = await Promise.all([
    cariDokumenPublik(villageId, filter),
    listArsipDokumen(villageId, filter.category),
  ]);

  return { ...halaman, arsip: susunArsipDokumen(arsipRows) };
}
