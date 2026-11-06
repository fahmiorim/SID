import "server-only";

import {
  ringkasAnggotaPublik,
  type KelompokAnggotaPublik,
  type KelompokListRow,
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
 */
export async function listKelompokPublik(villageId: number): Promise<KelompokPublikRow[]> {
  const [result, anggotaPerKelompok] = await Promise.all([
    listKelompokRows({
      villageId,
      search: "",
      tipe: "",
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
