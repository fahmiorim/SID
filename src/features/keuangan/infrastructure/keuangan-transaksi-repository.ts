import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { keuanganTransaksi } from "@/db/schema";
import type { PembukuanJenis } from "@/features/keuangan/domain/pembukuan";

/** Baris transaksi manual apa adanya dari tabel `keuangan_transaksi`. */
export interface TransaksiRow {
  id: number;
  tanggal: Date;
  keterangan: string;
  jumlah: string;
  jenis: PembukuanJenis;
}

/**
 * Daftar transaksi manual milik satu desa, terbaru dulu.
 *
 * `jenis` opsional; tanpa filter, pendapatan dan belanja sama-sama tampil.
 */
export async function listKeuanganTransaksi(
  villageId: number,
  jenis?: PembukuanJenis,
): Promise<TransaksiRow[]> {
  const filters = [eq(keuanganTransaksi.villageId, villageId)];
  if (jenis) filters.push(eq(keuanganTransaksi.jenis, jenis));

  return db
    .select({
      id: keuanganTransaksi.id,
      tanggal: keuanganTransaksi.tanggal,
      keterangan: keuanganTransaksi.keterangan,
      jumlah: keuanganTransaksi.jumlah,
      jenis: keuanganTransaksi.jenis,
    })
    .from(keuanganTransaksi)
    .where(and(...filters))
    .orderBy(desc(keuanganTransaksi.tanggal), desc(keuanganTransaksi.id));
}

/** Simpan satu transaksi manual baru. */
export async function saveKeuanganTransaksi(
  villageId: number,
  input: {
    tanggal: Date;
    keterangan: string;
    jumlah: string;
    jenis: PembukuanJenis;
  },
  createdBy: string,
): Promise<void> {
  await db.insert(keuanganTransaksi).values({
    villageId,
    tanggal: input.tanggal,
    keterangan: input.keterangan,
    jumlah: input.jumlah,
    jenis: input.jenis,
    createdBy,
  });
}

/** Apakah transaksi masih ada dan milik desa tersebut. */
export async function findKeuanganTransaksi(
  villageId: number,
  id: number,
): Promise<{ id: number } | null> {
  const [row] = await db
    .select({ id: keuanganTransaksi.id })
    .from(keuanganTransaksi)
    .where(and(eq(keuanganTransaksi.id, id), eq(keuanganTransaksi.villageId, villageId)))
    .limit(1);
  return row ?? null;
}

/** Hapus satu transaksi manual milik desa. */
export async function deleteKeuanganTransaksi(villageId: number, id: number): Promise<void> {
  await db
    .delete(keuanganTransaksi)
    .where(and(eq(keuanganTransaksi.id, id), eq(keuanganTransaksi.villageId, villageId)));
}
