import "server-only";

import {
  listProdukDenganKoordinat,
  listProdukPublik,
} from "../infrastructure/lapak-produk-repository";
import {
  findLapak,
  listKategoriLapak,
  listLapak,
  listLapakPublikSitemap,
} from "../infrastructure/lapak-repository";

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

/** Detail satu lapak untuk halaman publik. */
export async function getLapakPublik(villageId: number, lapakId: number) {
  return findLapak(villageId, lapakId);
}

/** Produk aktif satu lapak untuk halaman publik. */
export async function daftarProdukLapakPublik(
  villageId: number,
  lapakId: number,
  opts?: { page?: number },
) {
  return listProdukPublik(villageId, lapakId, opts);
}

/** Produk berkoordinat untuk peta publik. */
export async function daftarProdukPetaPublik(villageId: number) {
  return listProdukDenganKoordinat(villageId);
}

/** Lapak yang dipublikasikan untuk sitemap. */
export async function daftarLapakSitemap(villageId: number, batas: number) {
  return listLapakPublikSitemap(villageId, batas);
}
