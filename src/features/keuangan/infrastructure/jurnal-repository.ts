import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { keuanganJurnal, keuanganSaldoBank } from "@/db/schema";
import type { SaldoBankInput } from "@/features/keuangan/domain/jurnal";

/**
 * Akses data jurnal pembukuan & saldo bank.
 *
 * Semua query di-scope `village_id` yang diberikan lapisan aplikasi (berasal
 * dari sesi, bukan input klien). Kolom `created_by` menyimpan `users.id`
 * pemanggil.
 */

export interface JurnalRow {
  id: number;
  tahun: number;
  tanggal: string;
  kodeRekening: string;
  uraian: string;
  debet: string;
  kredit: string;
  sumber: string;
  referensi: string | null;
  createdBy: string;
  createdAt: Date;
}

/** Daftar mutasi jurnal satu desa, terbaru dulu. */
export async function listJurnal(
  villageId: number,
  filter: { tahun?: number; limit?: number } = {},
): Promise<JurnalRow[]> {
  const filters = [eq(keuanganJurnal.villageId, villageId)];
  if (filter.tahun !== undefined) filters.push(eq(keuanganJurnal.tahun, filter.tahun));

  return db
    .select({
      id: keuanganJurnal.id,
      tahun: keuanganJurnal.tahun,
      tanggal: keuanganJurnal.tanggal,
      kodeRekening: keuanganJurnal.kodeRekening,
      uraian: keuanganJurnal.uraian,
      debet: keuanganJurnal.debet,
      kredit: keuanganJurnal.kredit,
      sumber: keuanganJurnal.sumber,
      referensi: keuanganJurnal.referensi,
      createdBy: keuanganJurnal.createdBy,
      createdAt: keuanganJurnal.createdAt,
    })
    .from(keuanganJurnal)
    .where(and(...filters))
    .orderBy(desc(keuanganJurnal.tanggal), desc(keuanganJurnal.id))
    .limit(filter.limit ?? 500);
}

/** Tahun anggaran yang sudah punya entri jurnal. */
export async function listJurnalTahunTersedia(villageId: number): Promise<number[]> {
  const rows = await db
    .selectDistinct({ tahun: keuanganJurnal.tahun })
    .from(keuanganJurnal)
    .where(eq(keuanganJurnal.villageId, villageId))
    .orderBy(asc(keuanganJurnal.tahun));

  return rows.map((row) => row.tahun);
}

/**
 * Total debet/kredit seluruh jurnal pada satu tahun.
 *
 * Dijumlahkan di database (bukan dari baris yang dibatasi `limit`) agar angka
 * ringkasan tetap benar walau daftar yang ditampilkan dipotong.
 */
export async function ringkasJurnal(
  villageId: number,
  tahun?: number,
): Promise<{ debet: string; kredit: string; jumlah: number }> {
  const filters = [eq(keuanganJurnal.villageId, villageId)];
  if (tahun !== undefined) filters.push(eq(keuanganJurnal.tahun, tahun));

  const [row] = await db
    .select({
      debet: sql<string>`COALESCE(SUM(${keuanganJurnal.debet}), 0)`,
      kredit: sql<string>`COALESCE(SUM(${keuanganJurnal.kredit}), 0)`,
      jumlah: sql<number>`COUNT(*)`,
    })
    .from(keuanganJurnal)
    .where(and(...filters));

  if (!row) return { debet: "0.00", kredit: "0.00", jumlah: 0 };

  return { debet: String(row.debet), kredit: String(row.kredit), jumlah: Number(row.jumlah) };
}

/** Simpan satu mutasi jurnal manual; mengembalikan `id` baris baru. */
export async function insertJurnal(
  villageId: number,
  input: {
    tahun: number;
    tanggal: string;
    kodeRekening: string;
    uraian: string;
    debet: string;
    kredit: string;
    referensi: string | null;
  },
  createdBy: string,
): Promise<number> {
  const [inserted] = await db
    .insert(keuanganJurnal)
    .values({ villageId, sumber: "manual", createdBy, ...input })
    .$returningId();

  if (!inserted) throw new Error("Operasi database tidak mengembalikan hasil.");
  return inserted.id;
}

/** Apakah entri jurnal masih ada dan milik desa tersebut. */
export async function findJurnal(villageId: number, id: number): Promise<{ id: number } | null> {
  const [row] = await db
    .select({ id: keuanganJurnal.id })
    .from(keuanganJurnal)
    .where(and(eq(keuanganJurnal.id, id), eq(keuanganJurnal.villageId, villageId)))
    .limit(1);
  return row ?? null;
}

/** Hapus satu entri jurnal milik desa. */
export async function deleteJurnal(villageId: number, id: number): Promise<void> {
  await db
    .delete(keuanganJurnal)
    .where(and(eq(keuanganJurnal.id, id), eq(keuanganJurnal.villageId, villageId)));
}

export interface SaldoBankRow {
  id: number;
  tahun: number;
  rekeningBank: string;
  namaBank: string;
  saldoAwal: string;
  updatedAt: Date;
}

/** Saldo awal rekening bank satu desa pada satu tahun (semua rekening). */
export async function listSaldoBank(villageId: number, tahun?: number): Promise<SaldoBankRow[]> {
  const filters = [eq(keuanganSaldoBank.villageId, villageId)];
  if (tahun !== undefined) filters.push(eq(keuanganSaldoBank.tahun, tahun));

  return db
    .select({
      id: keuanganSaldoBank.id,
      tahun: keuanganSaldoBank.tahun,
      rekeningBank: keuanganSaldoBank.rekeningBank,
      namaBank: keuanganSaldoBank.namaBank,
      saldoAwal: keuanganSaldoBank.saldoAwal,
      updatedAt: keuanganSaldoBank.updatedAt,
    })
    .from(keuanganSaldoBank)
    .where(and(...filters))
    .orderBy(asc(keuanganSaldoBank.tahun), asc(keuanganSaldoBank.namaBank));
}

/**
 * Simpan saldo awal satu rekening.
 *
 * Kombinasi (`village_id`, `tahun`, `rekening_bank`) unik, jadi penulisan
 * memakai UPSERT agar menjalankan ulang tidak menggandakan baris.
 */
export async function upsertSaldoBank(
  villageId: number,
  input: Omit<SaldoBankInput, "saldoAwal"> & { saldoAwal: string },
): Promise<void> {
  await db
    .insert(keuanganSaldoBank)
    .values({
      villageId,
      tahun: input.tahun,
      rekeningBank: input.rekeningBank,
      namaBank: input.namaBank,
      saldoAwal: input.saldoAwal,
    })
    .onDuplicateKeyUpdate({
      set: {
        namaBank: sql`values(nama_bank)`,
        saldoAwal: sql`values(saldo_awal)`,
      },
    });
}
