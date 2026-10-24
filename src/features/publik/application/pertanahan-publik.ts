import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { inventaris } from "@/db/schema";

/**
 * Catatan pertanahan untuk halaman publik.
 *
 * Skema pertanahan/persil belum ada, sehingga sementara data diambil dari
 * inventaris desa sebagai penanda. Setelah modul pertanahan dibangun, cukup
 * ganti isi fungsi ini; halaman rute tidak perlu diubah.
 */
export interface CatatanPertanahan {
  id: number;
  nama: string;
  kode: string | null;
  keterangan: string | null;
  createdAt: Date;
}

export async function listCatatanPertanahan(villageId: number): Promise<CatatanPertanahan[]> {
  return db
    .select({
      id: inventaris.id,
      nama: inventaris.namaBarang,
      kode: inventaris.kodeBarang,
      keterangan: inventaris.keterangan,
      createdAt: inventaris.createdAt,
    })
    .from(inventaris)
    .where(eq(inventaris.villageId, villageId))
    .orderBy(desc(inventaris.id));
}
