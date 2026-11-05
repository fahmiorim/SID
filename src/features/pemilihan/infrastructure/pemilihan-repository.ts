import { and, asc, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { pemilihan, pemilihanKandidat } from "@/db/schema";
import type { KandidatDTO } from "@/features/pemilihan/domain/pemilihan";

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

/** Satu pemilihan milik desa, atau `null` bila tidak ada. */
export async function getPemilihanById(villageId: number, id: number) {
  const [row] = await db
    .select()
    .from(pemilihan)
    .where(and(eq(pemilihan.id, id), eq(pemilihan.villageId, villageId)))
    .limit(1);

  return row ?? null;
}

/** Daftar kandidat sebuah pemilihan (urut nomor urut). */
export async function listKandidat(villageId: number, pemilihanId: number): Promise<KandidatDTO[]> {
  return db
    .select({
      id: pemilihanKandidat.id,
      pemilihanId: pemilihanKandidat.pemilihanId,
      nomorUrut: pemilihanKandidat.nomorUrut,
      nama: pemilihanKandidat.nama,
      keterangan: pemilihanKandidat.keterangan,
      jumlahSuara: pemilihanKandidat.jumlahSuara,
    })
    .from(pemilihanKandidat)
    .where(
      and(
        eq(pemilihanKandidat.villageId, villageId),
        eq(pemilihanKandidat.pemilihanId, pemilihanId),
      ),
    )
    .orderBy(asc(pemilihanKandidat.nomorUrut));
}

/** Semua kandidat desa (untuk tampilan publik yang memuat banyak pemilihan). */
export async function listKandidatByVillage(villageId: number): Promise<KandidatDTO[]> {
  return db
    .select({
      id: pemilihanKandidat.id,
      pemilihanId: pemilihanKandidat.pemilihanId,
      nomorUrut: pemilihanKandidat.nomorUrut,
      nama: pemilihanKandidat.nama,
      keterangan: pemilihanKandidat.keterangan,
      jumlahSuara: pemilihanKandidat.jumlahSuara,
    })
    .from(pemilihanKandidat)
    .where(eq(pemilihanKandidat.villageId, villageId))
    .orderBy(asc(pemilihanKandidat.pemilihanId), asc(pemilihanKandidat.nomorUrut));
}

/** Satu kandidat milik desa. */
export async function findKandidat(villageId: number, id: number): Promise<KandidatDTO | null> {
  const [row] = await db
    .select({
      id: pemilihanKandidat.id,
      pemilihanId: pemilihanKandidat.pemilihanId,
      nomorUrut: pemilihanKandidat.nomorUrut,
      nama: pemilihanKandidat.nama,
      keterangan: pemilihanKandidat.keterangan,
      jumlahSuara: pemilihanKandidat.jumlahSuara,
    })
    .from(pemilihanKandidat)
    .where(and(eq(pemilihanKandidat.id, id), eq(pemilihanKandidat.villageId, villageId)))
    .limit(1);

  return row ?? null;
}

/** Apakah nomor urut sudah dipakai kandidat lain pada pemilihan yang sama. */
export async function nomorUrutDipakai(
  villageId: number,
  pemilihanId: number,
  nomorUrut: number,
  excludeId: number | null,
): Promise<boolean> {
  const rows = await db
    .select({ id: pemilihanKandidat.id })
    .from(pemilihanKandidat)
    .where(
      and(
        eq(pemilihanKandidat.villageId, villageId),
        eq(pemilihanKandidat.pemilihanId, pemilihanId),
        eq(pemilihanKandidat.nomorUrut, nomorUrut),
        excludeId === null ? undefined : ne(pemilihanKandidat.id, excludeId),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

/** Tambah kandidat, mengembalikan id barunya. */
export async function createKandidat(
  villageId: number,
  pemilihanId: number,
  input: { nomorUrut: number; nama: string; keterangan: string | null; jumlahSuara: number },
): Promise<number> {
  const [result] = await db
    .insert(pemilihanKandidat)
    .values({ villageId, pemilihanId, ...input })
    .$returningId();

  return result?.id ?? 0;
}

/** Perbarui kandidat (scoped desa). */
export async function updateKandidat(
  villageId: number,
  id: number,
  input: { nomorUrut: number; nama: string; keterangan: string | null; jumlahSuara: number },
): Promise<void> {
  await db
    .update(pemilihanKandidat)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(pemilihanKandidat.id, id), eq(pemilihanKandidat.villageId, villageId)));
}

/** Hapus kandidat (scoped desa). */
export async function deleteKandidat(villageId: number, id: number): Promise<void> {
  await db
    .delete(pemilihanKandidat)
    .where(and(eq(pemilihanKandidat.id, id), eq(pemilihanKandidat.villageId, villageId)));
}
