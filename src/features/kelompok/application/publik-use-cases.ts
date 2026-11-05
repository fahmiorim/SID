import "server-only";

import type { AnggotaPublikRow } from "@/features/kelompok/domain/anggota-publik";
import type { KelompokListRow } from "@/features/kelompok/domain/kelompok";
import {
  listAnggotaPublik as listAnggotaPublikRows,
  listKelompok as listKelompokRows,
} from "@/features/kelompok/infrastructure/kelompok-repository";

/**
 * Data kelompok & lembaga untuk situs publik.
 *
 * Tidak memakai use case admin karena halaman publik tidak punya sesi. Query
 * tetap dibatasi `villageId` dari host, dan hanya kolom yang aman ditampilkan.
 */

/** Daftar kelompok/lembaga; `tipe` kosong berarti semua. */
export async function listKelompokPublik(
  villageId: number,
  tipe: string = "",
): Promise<KelompokListRow[]> {
  const result = await listKelompokRows({
    villageId,
    search: "",
    tipe,
    categoryId: null,
    page: 1,
    pageSize: 500,
  });

  return result.rows;
}

/** Anggota kelompok yang ditandai tampil publik (tanpa NIK). */
export async function listAnggotaKelompokPublik(
  villageId: number,
  tipe: string = "",
): Promise<AnggotaPublikRow[]> {
  return listAnggotaPublikRows(villageId, tipe);
}
