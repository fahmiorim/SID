import "server-only";

import type { InventarisRow } from "@/features/inventaris/domain/inventaris";
import {
  FILTER_INVENTARIS_KOSONG,
  namaBerkasInventarisPublik,
  type InventarisFilter,
  type OpsiInventarisPublik,
} from "@/features/inventaris/domain/inventaris-publik";
import { buildInventarisCsv } from "@/features/inventaris/domain/laporan-inventaris";
import {
  listInventarisPublik as listInventarisPublikRows,
  listOpsiInventarisPublik,
} from "@/features/inventaris/infrastructure/inventaris-repository";
import { rekapInventaris, type RekapInventaris } from "@/features/publik/domain/ringkasan-publik";

export type InventarisPublikRow = InventarisRow & {
  kategoriNama: string | null;
  kategoriKode: string | null;
};

export interface InventarisPublik {
  rows: InventarisPublikRow[];
  rekap: RekapInventaris;
  opsi: OpsiInventarisPublik;
}

/**
 * Data inventaris untuk situs publik.
 *
 * Hanya barang yang belum dihapus yang dikembalikan repository; filter
 * (kategori/kondisi/lokasi/tahun) diterapkan di SQL sehingga rekap, tabel, dan
 * CSV konsisten. Tidak ada pemeriksaan izin karena halaman ini transparansi
 * aset desa; tenant tetap dibatasi `villageId` dari host.
 */
export async function getInventarisPublik(
  villageId: number,
  filter: InventarisFilter = FILTER_INVENTARIS_KOSONG,
): Promise<InventarisPublik> {
  const [rows, opsi] = await Promise.all([
    listInventarisPublikRows(villageId, filter),
    listOpsiInventarisPublik(villageId),
  ]);

  return { rows, rekap: rekapInventaris(rows), opsi };
}

/** CSV transparansi aset sesuai filter aktif, beserta nama berkasnya. */
export async function eksporInventarisPublik(
  villageId: number,
  filter: InventarisFilter,
  namaDesa: string | null,
): Promise<{ filename: string; csv: string }> {
  const [rows, opsi] = await Promise.all([
    listInventarisPublikRows(villageId, filter),
    listOpsiInventarisPublik(villageId),
  ]);

  const kategoriNama = opsi.kategori.find((item) => item.id === filter.kategoriId)?.nama ?? null;

  return {
    filename: namaBerkasInventarisPublik(namaDesa, filter, kategoriNama),
    csv: buildInventarisCsv(rows),
  };
}
