import "server-only";

import { hitungRekapSuara } from "../domain/pemilihan";
import { listKandidatByVillage, listPemilihan } from "../infrastructure/pemilihan-repository";

/**
 * Daftar pemilihan yang ditampilkan di situs publik, lengkap dengan kandidat
 * dan rekapitulasi perolehan suaranya.
 *
 * Hanya membaca; `villageId` wajib berasal dari host (bukan input klien).
 */
export async function daftarPemilihanPublik(villageId: number) {
  const [rows, semuaKandidat] = await Promise.all([
    listPemilihan(villageId),
    listKandidatByVillage(villageId),
  ]);

  return rows.map((row) => {
    const kandidat = semuaKandidat.filter((item) => item.pemilihanId === row.id);

    return {
      ...row,
      tanggal: row.tanggal ? new Date(row.tanggal).toISOString().slice(0, 10) : null,
      kandidat,
      rekap: hitungRekapSuara(kandidat),
    };
  });
}
