import "server-only";

import { listBulananAnak, listIbuHamil, listKia } from "../infrastructure/kesehatan-repository";

/**
 * Data kesehatan untuk halaman publik.
 *
 * Tidak ada pemeriksaan izin admin karena data ini memang dipublikasikan;
 * `villageId` wajib berasal dari host, bukan input klien.
 */
export async function daftarKiaPublik(villageId: number) {
  return listKia(villageId);
}

export async function daftarIbuHamilPublik(villageId: number) {
  return listIbuHamil(villageId);
}

export async function daftarBulananAnakPublik(villageId: number) {
  return listBulananAnak(villageId);
}
