import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { keuanganLaporan } from "@/db/schema";
import {
  laporanTipeLabel,
  semesterLabel,
  sudahTerkirim,
  type LaporanDokumenRow,
} from "@/features/keuangan/domain/laporan-dokumen";

/** Ubah `Date | null` menjadi string ISO agar aman dilewatkan ke komponen. */
function tanggal(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function keRow(row: typeof keuanganLaporan.$inferSelect): LaporanDokumenRow {
  const kirimPada = tanggal(row.kirimPada);
  return {
    id: row.id,
    tipe: row.tipe,
    tipeLabel: laporanTipeLabel(row.tipe),
    judul: row.judul,
    tahun: row.tahun,
    semester: row.semester,
    semesterLabel: semesterLabel(row.semester),
    namaFile: row.namaFile,
    terkirim: sudahTerkirim(kirimPada),
    kirimPada,
    dibuatPada: row.createdAt.toISOString(),
  };
}

export async function listLaporanDokumen(
  villageId: number,
  tahun?: number,
): Promise<LaporanDokumenRow[]> {
  const rows = await db
    .select()
    .from(keuanganLaporan)
    .where(
      tahun === undefined
        ? eq(keuanganLaporan.villageId, villageId)
        : and(eq(keuanganLaporan.villageId, villageId), eq(keuanganLaporan.tahun, tahun)),
    )
    .orderBy(desc(keuanganLaporan.tahun), desc(keuanganLaporan.semester), desc(keuanganLaporan.id));

  return rows.map(keRow);
}

/** Cari satu laporan dokumen milik desa (dibatasi `villageId`). */
export async function findLaporanDokumen(
  villageId: number,
  id: number,
): Promise<(LaporanDokumenRow & { jalurFile: string }) | null> {
  const [row] = await db
    .select()
    .from(keuanganLaporan)
    .where(and(eq(keuanganLaporan.villageId, villageId), eq(keuanganLaporan.id, id)))
    .limit(1);

  if (!row) return null;
  return { ...keRow(row), jalurFile: row.jalurFile };
}

export interface LaporanDokumenInsert {
  tipe: string;
  judul: string;
  tahun: number;
  semester: number;
  namaFile: string;
  jalurFile: string;
  ukuranFile: number;
  createdBy: string;
}

export async function insertLaporanDokumen(
  villageId: number,
  input: LaporanDokumenInsert,
): Promise<number> {
  const [inserted] = await db
    .insert(keuanganLaporan)
    .values({ ...input, villageId })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan laporan.");
  return inserted.id;
}

/** Ganti metadata + berkas laporan yang sudah ada. */
export async function updateLaporanDokumen(
  villageId: number,
  id: number,
  input: Omit<LaporanDokumenInsert, "createdBy">,
): Promise<void> {
  await db
    .update(keuanganLaporan)
    .set({ ...input })
    .where(and(eq(keuanganLaporan.villageId, villageId), eq(keuanganLaporan.id, id)));
}

export async function deleteLaporanDokumen(villageId: number, id: number): Promise<void> {
  await db
    .delete(keuanganLaporan)
    .where(and(eq(keuanganLaporan.villageId, villageId), eq(keuanganLaporan.id, id)));
}

/** Tandai laporan sudah dikirim ke kecamatan (atau batalkan penandaan). */
export async function setLaporanTerkirim(
  villageId: number,
  id: number,
  terkirim: boolean,
): Promise<void> {
  await db
    .update(keuanganLaporan)
    .set({ kirimPada: terkirim ? new Date() : null })
    .where(and(eq(keuanganLaporan.villageId, villageId), eq(keuanganLaporan.id, id)));
}

/** Apakah sudah ada dokumen untuk (tipe, tahun, semester) selain `kecualiId`? */
export async function adaLaporanSama(
  villageId: number,
  tipe: string,
  tahun: number,
  semester: number,
  kecualiId?: number,
): Promise<boolean> {
  const rows = await db
    .select({ id: keuanganLaporan.id })
    .from(keuanganLaporan)
    .where(
      and(
        eq(keuanganLaporan.villageId, villageId),
        eq(keuanganLaporan.tipe, tipe),
        eq(keuanganLaporan.tahun, tahun),
        eq(keuanganLaporan.semester, semester),
      ),
    );

  return rows.some((row) => row.id !== kecualiId);
}
