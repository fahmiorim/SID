import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { perangkatDesa } from "@/db/schema/content";
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
  villageId: number,
  tahun: number,
  bulan?: number,
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
  const conditions = [eq(kehadiranPerangkat.villageId, villageId)];
  if (tahun) {
    conditions.push(
      and(
        sql`${kehadiranPerangkat.tanggal} >= ${new Date(tahun, 0, 1).toISOString().split("T")[0]}`,
        sql`${kehadiranPerangkat.tanggal} <= ${new Date(tahun, 11, 31, 23, 59, 59).toISOString().split("T")[0]}`,
      ),
    );
    if (bulan) {
      conditions.pop();
      conditions.push(
        and(
          sql`${kehadiranPerangkat.tanggal} >= ${new Date(tahun, bulan - 1, 1).toISOString().split("T")[0]}`,
          sql`${kehadiranPerangkat.tanggal} <= ${new Date(tahun, bulan, 0, 23, 59, 59).toISOString().split("T")[0]}`,
        ),
      );
    }
  }

  const filteredConditions = conditions.filter((c): c is NonNullable<typeof c> => c != null);
  const rows = await db
    .select({
      perangkatId: kehadiranPerangkat.perangkatId,
      tanggal: kehadiranPerangkat.tanggal,
      status: kehadiranPerangkat.status,
    })
    .from(kehadiranPerangkat)
    .where(and(...filteredConditions));

  const perangkatList = await db
    .select()
    .from(perangkatDesa)
    .where(eq(perangkatDesa.villageId, villageId));
  const perangkatMap = new Map(perangkatList.map((p) => [p.id, p]));

  const result = new Map<
    number,
    {
      perangkatId: number;
      nama: string;
      jabatan: string;
      hadir: number;
      izin: number;
      sakit: number;
      alpa: number;
    }
  >();

  for (const row of rows) {
    if (!row.perangkatId) continue;
    const existing = result.get(row.perangkatId);
    if (!existing) {
      const perangkat = perangkatMap.get(row.perangkatId);
      result.set(row.perangkatId, {
        perangkatId: row.perangkatId,
        nama: perangkat?.nama ?? "-",
        jabatan: perangkat?.jabatanId?.toString() ?? "-",
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
      });
    }
    const current = result.get(row.perangkatId)!;
    if (row.status === "hadir") current.hadir += 1;
    else if (row.status === "izin") current.izin += 1;
    else if (row.status === "sakit") current.sakit += 1;
    else if (row.status === "alpa") current.alpa += 1;
  }

  return [...result.values()];
}
