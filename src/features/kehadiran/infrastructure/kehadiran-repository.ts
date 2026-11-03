import "server-only";

import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import { perangkatDesa } from "@/db/schema/content";
import {
  kehadiranPerangkat,
  type KehadiranPerangkat,
  type NewKehadiranPerangkat,
} from "@/db/schema/kehadiran";

function tanggalUtc(tahun: number, bulan: number, hari: number): Date {
  return new Date(Date.UTC(tahun, bulan, hari));
}

export async function listKehadiran(
  villageId: number,
  opts?: { bulan?: number; tahun?: number; perangkatId?: number },
): Promise<KehadiranPerangkat[]> {
  const conditions = [eq(kehadiranPerangkat.villageId, villageId)];

  if (opts?.tahun && opts.bulan) {
    conditions.push(
      gte(kehadiranPerangkat.tanggal, tanggalUtc(opts.tahun, opts.bulan - 1, 1)),
      lte(kehadiranPerangkat.tanggal, tanggalUtc(opts.tahun, opts.bulan, 0)),
    );
  } else if (opts?.tahun) {
    conditions.push(
      gte(kehadiranPerangkat.tanggal, tanggalUtc(opts.tahun, 0, 1)),
      lte(kehadiranPerangkat.tanggal, tanggalUtc(opts.tahun, 11, 31)),
    );
  }

  if (opts?.perangkatId) {
    conditions.push(eq(kehadiranPerangkat.perangkatId, opts.perangkatId));
  }

  return db
    .select()
    .from(kehadiranPerangkat)
    .where(and(...conditions))
    .orderBy(desc(kehadiranPerangkat.tanggal));
}

export async function listPerangkatDesa(villageId: number) {
  return db
    .select({
      id: perangkatDesa.id,
      nama: perangkatDesa.nama,
      jabatanId: perangkatDesa.jabatanId,
    })
    .from(perangkatDesa)
    .where(eq(perangkatDesa.villageId, villageId));
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
      gte(
        kehadiranPerangkat.tanggal,
        bulan ? tanggalUtc(tahun, bulan - 1, 1) : tanggalUtc(tahun, 0, 1),
      ),
      lte(
        kehadiranPerangkat.tanggal,
        bulan ? tanggalUtc(tahun, bulan, 0) : tanggalUtc(tahun, 11, 31),
      ),
    );
  }

  const perangkatList = await listPerangkatDesa(villageId);
  const perangkatMap = new Map(perangkatList.map((perangkat) => [perangkat.id, perangkat]));
  const rows = await db
    .select({
      perangkatId: kehadiranPerangkat.perangkatId,
      status: kehadiranPerangkat.status,
    })
    .from(kehadiranPerangkat)
    .where(and(...conditions));

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
    let current = result.get(row.perangkatId);
    if (!current) {
      const perangkat = perangkatMap.get(row.perangkatId);
      current = {
        perangkatId: row.perangkatId,
        nama: perangkat?.nama ?? "-",
        jabatan: String(perangkat?.jabatanId ?? "-"),
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
      };
      result.set(row.perangkatId, current);
    }

    if (row.status === "hadir") current.hadir += 1;
    else if (row.status === "izin") current.izin += 1;
    else if (row.status === "sakit") current.sakit += 1;
    else if (row.status === "alpa") current.alpa += 1;
  }

  return [...result.values()].sort((a, b) => b.hadir - a.hadir);
}
