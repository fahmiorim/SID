import "server-only";

import { listPemilihan } from "../infrastructure/pemilihan-repository";

/**
 * Daftar pemilihan yang ditampilkan di situs publik.
 *
 * Hanya membaca; `villageId` wajib berasal dari host (bukan input klien).
 */
export async function daftarPemilihanPublik(villageId: number) {
  const rows = await listPemilihan(villageId);
  return rows.map((row) => ({
    ...row,
    tanggal: row.tanggal ? new Date(row.tanggal).toISOString().slice(0, 10) : null,
  }));
}
