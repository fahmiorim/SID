import "server-only";

import type { InventarisRow } from "@/features/inventaris/domain/inventaris";
import { listInventaris } from "@/features/inventaris/infrastructure/inventaris-repository";
import { rekapInventaris, type RekapInventaris } from "@/features/publik/domain/ringkasan-publik";

export type InventarisPublikRow = InventarisRow & {
  kategoriNama: string | null;
  kategoriKode: string | null;
};

export interface InventarisPublik {
  rows: InventarisPublikRow[];
  rekap: RekapInventaris;
}

/**
 * Data inventaris untuk situs publik.
 *
 * Hanya barang yang belum dihapus yang dikembalikan repository. Tidak ada
 * pemeriksaan izin karena halaman ini memang transparansi aset desa; tenant
 * tetap dibatasi `villageId` dari host.
 */
export async function getInventarisPublik(villageId: number): Promise<InventarisPublik> {
  const { rows } = await listInventaris(villageId);
  return { rows, rekap: rekapInventaris(rows) };
}
