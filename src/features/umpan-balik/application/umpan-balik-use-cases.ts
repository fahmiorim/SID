import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  UMPAN_BALIK_RESOURCE,
  type UmpanBalikInput,
  type UmpanBalikStatus,
} from "@/features/umpan-balik/domain/umpan-balik";
import {
  insertUmpanBalik,
  listUmpanBalik,
  updateStatusUmpanBalik,
  type UmpanBalikRow,
} from "@/features/umpan-balik/infrastructure/umpan-balik-repository";
import { requirePermission } from "@/lib/dal";
import { notFound } from "@/lib/errors";

/**
 * Kirim umpan balik dari formulir publik.
 * `villageId` wajib berasal dari host pemanggil, bukan input klien.
 */
export async function kirimUmpanBalik(villageId: number, input: UmpanBalikInput): Promise<number> {
  return insertUmpanBalik(villageId, input);
}

/** Daftar umpan balik untuk panel admin (butuh izin baca). */
export async function getDaftarUmpanBalik(status = ""): Promise<UmpanBalikRow[]> {
  const user = await requirePermission(UMPAN_BALIK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  return listUmpanBalik(villageId, { status });
}

/** Ubah status tindak lanjut (butuh izin ubah, scoped desa sesi). */
export async function ubahStatusUmpanBalik(id: number, status: UmpanBalikStatus): Promise<void> {
  const user = await requirePermission(UMPAN_BALIK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const ok = await updateStatusUmpanBalik(villageId, id, status);
  if (!ok) throw notFound("Umpan balik tidak ditemukan.");
}
