import "server-only";

import type { KelompokListRow } from "@/features/kelompok/domain/kelompok";
import { listKelompok as listKelompokRows } from "@/features/kelompok/infrastructure/kelompok-repository";

/**
 * Daftar kelompok & lembaga untuk situs publik.
 *
 * Tidak memakai use case admin karena halaman publik tidak punya sesi. Query
 * tetap dibatasi `villageId` dari host, dan hanya kolom yang aman ditampilkan
 * (nama, tipe, kategori, ketua, jumlah anggota).
 */
export async function listKelompokPublik(villageId: number): Promise<KelompokListRow[]> {
  const result = await listKelompokRows({
    villageId,
    search: "",
    tipe: "",
    categoryId: null,
    page: 1,
    pageSize: 500,
  });

  return result.rows;
}
