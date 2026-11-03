import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { pemilihan } from "@/db/schema";

/** Ambil semua pemilihan untuk desa */
export async function listPemilihan(villageId: number) {
  return await db
    .select({
      id: pemilihan.id,
      villageId: pemilihan.villageId,
      tahun: pemilihan.tahun,
      jenis: pemilihan.jenis,
      tanggal: pemilihan.tanggal,
      keterangan: pemilihan.keterangan,
    })
    .from(pemilihan)
    .where(eq(pemilihan.villageId, villageId))
    .orderBy(desc(pemilihan.tahun));
}

/** Ambil pemilihan aktif (hanya satu per desa) */
export async function getAktifPemilihan(villageId: number) {
  const results = await db.select().from(pemilihan).where(eq(pemilihan.villageId, villageId));
  if (results.length === 0) return null;
  // Urutkan berdasarkan tahun desc, ambil yang pertama
  return results.sort((a, b) => (b.tahun ?? 0) - (a.tahun ?? 0))[0];
}

/** Buat pemilihan baru */
export async function createPemilihan(
  villageId: number,
  input: {
    tahun: number;
    jenis: string;
    tanggal?: string | null;
    keterangan?: string | null;
  },
) {
  const tanggalDate = input.tanggal ? new Date(input.tanggal) : null;
  const [result] = await db
    .insert(pemilihan)
    .values({
      villageId,
      tahun: input.tahun,
      jenis: input.jenis,
      tanggal: tanggalDate,
      keterangan: input.keterangan,
    })
    .$returningId();
  return result?.id ?? 0;
}

/** Update pemilihan */
export async function updatePemilihan(
  id: number,
  villageId: number,
  input: {
    tahun?: number;
    jenis?: string;
    tanggal?: string | null;
    keterangan?: string | null;
  },
) {
  const tanggalDate = input.tanggal ? new Date(input.tanggal) : null;
  await db
    .update(pemilihan)
    .set({
      tahun: input.tahun,
      jenis: input.jenis,
      tanggal: tanggalDate,
      keterangan: input.keterangan,
    })
    .where(and(eq(pemilihan.id, id), eq(pemilihan.villageId, villageId)));
  return null;
}

/** Hapus pemilihan */
export async function deletePemilihan(id: number, villageId: number) {
  await db.delete(pemilihan).where(and(eq(pemilihan.id, id), eq(pemilihan.villageId, villageId)));
}
