import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  bumindesAgenda,
  bumindesAparat,
  bumindesPeraturan,
} from "@/db/schema/bumindes-sekretariat";

export interface PeraturanValues {
  jenis: string;
  nomor: string;
  tahun: number | null;
  tentang: string;
  tanggalDitetapkan: string | null;
  tanggalDiundangkan: string | null;
  keterangan: string | null;
}

export interface AparatValues {
  nama: string;
  nip: string | null;
  jabatan: string;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  pendidikan: string | null;
  nomorSkPengangkatan: string | null;
  tanggalPengangkatan: string | null;
  nomorSkPemberhentian: string | null;
  tanggalPemberhentian: string | null;
  keterangan: string | null;
}

export interface AgendaValues {
  jenis: string;
  tanggal: string;
  nomorSurat: string | null;
  asalTujuan: string | null;
  perihal: string;
  keterangan: string | null;
}

export async function listBumindesPeraturan(villageId: number, jenis?: string) {
  const kondisi = [eq(bumindesPeraturan.villageId, villageId)];
  if (jenis) kondisi.push(eq(bumindesPeraturan.jenis, jenis));
  return db
    .select()
    .from(bumindesPeraturan)
    .where(and(...kondisi))
    .orderBy(desc(bumindesPeraturan.tahun), desc(bumindesPeraturan.id));
}

export async function getBumindesPeraturan(villageId: number, id: number) {
  const [row] = await db
    .select()
    .from(bumindesPeraturan)
    .where(and(eq(bumindesPeraturan.villageId, villageId), eq(bumindesPeraturan.id, id)))
    .limit(1);
  return row ?? null;
}

export async function insertBumindesPeraturan(villageId: number, values: PeraturanValues) {
  const [row] = await db
    .insert(bumindesPeraturan)
    .values({ villageId, ...values })
    .$returningId();
  if (!row) throw new Error("Gagal menyimpan peraturan/keputusan.");
  return row.id;
}

export async function updateBumindesPeraturan(
  villageId: number,
  id: number,
  values: PeraturanValues,
) {
  const [result] = await db
    .update(bumindesPeraturan)
    .set(values)
    .where(and(eq(bumindesPeraturan.villageId, villageId), eq(bumindesPeraturan.id, id)));
  return result.affectedRows > 0;
}

export async function deleteBumindesPeraturan(villageId: number, id: number) {
  const [result] = await db
    .delete(bumindesPeraturan)
    .where(and(eq(bumindesPeraturan.villageId, villageId), eq(bumindesPeraturan.id, id)));
  return result.affectedRows > 0;
}

export async function listBumindesAparat(villageId: number) {
  return db
    .select()
    .from(bumindesAparat)
    .where(eq(bumindesAparat.villageId, villageId))
    .orderBy(asc(bumindesAparat.jabatan), asc(bumindesAparat.id));
}

export async function getBumindesAparat(villageId: number, id: number) {
  const [row] = await db
    .select()
    .from(bumindesAparat)
    .where(and(eq(bumindesAparat.villageId, villageId), eq(bumindesAparat.id, id)))
    .limit(1);
  return row ?? null;
}

export async function insertBumindesAparat(villageId: number, values: AparatValues) {
  const [row] = await db
    .insert(bumindesAparat)
    .values({ villageId, ...values })
    .$returningId();
  if (!row) throw new Error("Gagal menyimpan aparat.");
  return row.id;
}

export async function updateBumindesAparat(villageId: number, id: number, values: AparatValues) {
  const [result] = await db
    .update(bumindesAparat)
    .set(values)
    .where(and(eq(bumindesAparat.villageId, villageId), eq(bumindesAparat.id, id)));
  return result.affectedRows > 0;
}

export async function deleteBumindesAparat(villageId: number, id: number) {
  const [result] = await db
    .delete(bumindesAparat)
    .where(and(eq(bumindesAparat.villageId, villageId), eq(bumindesAparat.id, id)));
  return result.affectedRows > 0;
}

export async function listBumindesAgenda(villageId: number, jenis?: string) {
  const kondisi = [eq(bumindesAgenda.villageId, villageId)];
  if (jenis) kondisi.push(eq(bumindesAgenda.jenis, jenis));
  return db
    .select()
    .from(bumindesAgenda)
    .where(and(...kondisi))
    .orderBy(desc(bumindesAgenda.tanggal), desc(bumindesAgenda.id));
}

export async function getBumindesAgenda(villageId: number, id: number) {
  const [row] = await db
    .select()
    .from(bumindesAgenda)
    .where(and(eq(bumindesAgenda.villageId, villageId), eq(bumindesAgenda.id, id)))
    .limit(1);
  return row ?? null;
}

export async function insertBumindesAgenda(villageId: number, values: AgendaValues) {
  const [row] = await db
    .insert(bumindesAgenda)
    .values({ villageId, ...values })
    .$returningId();
  if (!row) throw new Error("Gagal menyimpan agenda.");
  return row.id;
}

export async function updateBumindesAgenda(villageId: number, id: number, values: AgendaValues) {
  const [result] = await db
    .update(bumindesAgenda)
    .set(values)
    .where(and(eq(bumindesAgenda.villageId, villageId), eq(bumindesAgenda.id, id)));
  return result.affectedRows > 0;
}

export async function deleteBumindesAgenda(villageId: number, id: number) {
  const [result] = await db
    .delete(bumindesAgenda)
    .where(and(eq(bumindesAgenda.villageId, villageId), eq(bumindesAgenda.id, id)));
  return result.affectedRows > 0;
}
