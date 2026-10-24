import "server-only";

import { listBantuanProgramPublik as listBantuanProgramRows } from "@/features/bantuan/infrastructure/bantuan-repository";

/**
 * Program bantuan untuk situs publik.
 *
 * Tenant dibatasi `villageId` dari host; tidak ada izin karena data ini memang
 * ditampilkan sebagai transparansi.
 */
export async function listBantuanProgramPublik(villageId: number) {
  return listBantuanProgramRows(villageId);
}
