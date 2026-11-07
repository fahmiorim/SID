import "server-only";

import { listKategoriLapak, listLapak } from "../infrastructure/lapak-repository";

/**
 * Katalog lapak untuk situs publik.
 *
 * Hanya membaca data desa yang berasal dari host; tanpa pemeriksaan izin admin.
 */
export async function daftarLapakPublik(
  villageId: number,
  opts?: { kategori?: string; q?: string; page?: number; pageSize?: number },
) {
  const [lapakPage, kategori] = await Promise.all([
    listLapak(villageId, opts),
    listKategoriLapak(villageId),
  ]);
  return { ...lapakPage, items: lapakPage.rows, kategori };
}
