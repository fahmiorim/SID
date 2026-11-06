import "server-only";

import {
  ringkasAnggotaPublik,
  type KelompokAnggotaPublik,
  type KelompokListRow,
  type KelompokTipe,
} from "@/features/kelompok/domain/kelompok";
import {
  listKelompokAnggotaPublik,
  listKelompok as listKelompokRows,
} from "@/features/kelompok/infrastructure/kelompok-repository";

export interface KelompokPublikRow extends KelompokListRow {
  /** Hanya anggota yang ditandai tampil publik (OS-WEB-010). */
  anggota: KelompokAnggotaPublik[];
}

/**
 * Daftar kelompok & lembaga untuk situs publik.
 *
 * Tidak memakai use case admin karena halaman publik tidak punya sesi. Query
 * tetap dibatasi `villageId` dari host. Jumlah anggota, ketua, dan rincian
 * anggota hanya berasal dari keanggotaan berstatus `tampil_publik`, sehingga
 * operator dapat menyembunyikan anggota tertentu tanpa memengaruhi panel admin.
 *
 * `tipe` opsional menyaring kelompok/lembaga; halaman publik memakainya lewat
 * tautan `/desa/kelompok?tipe=lembaga` (OS-WEB-003).
 */
export async function listKelompokPublik(
  villageId: number,
  tipe: KelompokTipe | null = null,
): Promise<KelompokPublikRow[]> {
  const [result, anggotaPerKelompok] = await Promise.all([
    listKelompokRows({
      villageId,
      search: "",
      tipe: tipe ?? "",
      categoryId: null,
      page: 1,
      pageSize: 500,
    }),
    listKelompokAnggotaPublik(villageId),
  ]);

  return result.rows.map((row) => {
    const ringkasan = ringkasAnggotaPublik(anggotaPerKelompok.get(row.id) ?? []);
    return {
      ...row,
      memberCount: ringkasan.jumlah,
      leaderName: ringkasan.ketua,
      anggota: ringkasan.anggota,
    };
  });
}
