import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  kehadiranPerangkat,
  type KehadiranPerangkat,
  type NewKehadiranPerangkat,
} from "@/db/schema/kehadiran";

export async function listKehadiran(
  villageId: number,
  opts?: { bulan?: number; tahun?: number; perangkatId?: number },
): Promise<KehadiranPerangkat[]> {
  const conditions = [eq(kehadiranPerangkat.villageId, villageId)];
  if (opts?.tahun && opts?.bulan) {
    const start = new Date(opts.tahun, opts.bulan - 1, 1).toISOString().split("T")[0];
    const end = new Date(opts.tahun, opts.bulan, 0, 23, 59, 59).toISOString().split("T")[0];
    conditions.push(sql`${kehadiranPerangkat.tanggal} >= ${start}`);
    conditions.push(sql`${kehadiranPerangkat.tanggal} <= ${end}`);
  } else if (opts?.tahun) {
    const start = new Date(opts.tahun, 0, 1).toISOString().split("T")[0];
    const end = new Date(opts.tahun, 11, 31, 23, 59, 59).toISOString().split("T")[0];
    conditions.push(sql`${kehadiranPerangkat.tanggal} >= ${start}`);
    conditions.push(sql`${kehadiranPerangkat.tanggal} <= ${end}`);
  }
  if (opts?.perangkatId) conditions.push(eq(kehadiranPerangkat.perangkatId, opts.perangkatId));
  return db
    .select()
    .from(kehadiranPerangkat)
    .where(and(...conditions))
    .orderBy(desc(kehadiranPerangkat.tanggal));
}

export async function createKehadiran(data: NewKehadiranPerangkat): Promise<number> {
  const result = await db.insert(kehadiranPerangkat).values(data);
  const insertId = result[0].insertId;
  return typeof insertId === "bigint" ? Number(insertId) : insertId;
}

export async function updateKehadiran(
  id: number,
  villageId: number,
  data: Partial<NewKehadiranPerangkat>,
): Promise<void> {
  await db
    .update(kehadiranPerangkat)
    .set(data)
    .where(and(eq(kehadiranPerangkat.id, id), eq(kehadiranPerangkat.villageId, villageId)));
}

export async function deleteKehadiran(id: number, villageId: number): Promise<void> {
  await db
    .delete(kehadiranPerangkat)
    .where(and(eq(kehadiranPerangkat.id, id), eq(kehadiranPerangkat.villageId, villageId)));
}

export async function getRekapKehadiran(
  _villageId: number,
  _tahun: number,
  _bulan?: number,
): Promise<
  {
    perangkatId: number;
    nama: string;
    jabatan: string;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
  }[]
> {
  return [];
}
