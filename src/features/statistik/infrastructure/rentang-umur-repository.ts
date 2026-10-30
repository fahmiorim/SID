import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { rentangUmur } from "@/db/schema/rentang-umur";
import { KELOMPOK_UMUR, type KelompokUmur } from "@/features/penduduk/domain/laporan-penduduk";
import { type RentangUmurDTO } from "@/features/statistik/domain/rentang-umur";

/** Ambil rentang umur aktif per desa; kosong = pakai default `KELOMPOK_UMUR`. */
export async function listRentangUmur(villageId: number): Promise<KelompokUmur[]> {
  const rows = await db
    .select({
      id: rentangUmur.id,
      nama: rentangUmur.nama,
      dari: rentangUmur.dari,
      sampai: rentangUmur.sampai,
    })
    .from(rentangUmur)
    .where(and(eq(rentangUmur.villageId, villageId), eq(rentangUmur.status, true)))
    .orderBy(rentangUmur.dari);

  if (rows.length === 0) return [...KELOMPOK_UMUR];

  return rows.map((r) => ({
    label: r.nama,
    min: r.dari,
    max: r.sampai,
    kode: `${r.dari}-${r.sampai ?? "+"}`,
  }));
}

/** Konversi baris DB ke DTO UI. */
export function mapRentangUmurRow(row: {
  id: number;
  villageId: number;
  nama: string;
  dari: number;
  sampai: number | null;
  status: boolean;
}): RentangUmurDTO {
  return {
    id: row.id,
    villageId: row.villageId,
    nama: row.nama,
    dari: row.dari,
    sampai: row.sampai,
    status: row.status,
  };
}
