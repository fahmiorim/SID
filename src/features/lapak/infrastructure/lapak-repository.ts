import "server-only";

import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { lapak, type Lapak, type NewLapak } from "@/db/schema/lapak";

export async function listLapak(
  villageId: number,
  opts?: { kategori?: string; q?: string },
): Promise<Lapak[]> {
  const where = [eq(lapak.villageId, villageId)];
  if (opts?.kategori) where.push(eq(lapak.kategori, opts.kategori));
  if (opts?.q) {
    where.push(
      or(
        ilike(lapak.nama, `%${opts.q}%`),
        ilike(lapak.pemilik ?? "", `%${opts.q}%`),
        ilike(lapak.alamat ?? "", `%${opts.q}%`),
        ilike(lapak.keterangan ?? "", `%${opts.q}%`),
      )!,
    );
  }
  return db
    .select()
    .from(lapak)
    .where(and(...where))
    .orderBy(desc(lapak.id));
}

export async function createLapak(data: NewLapak): Promise<number> {
  const result = await db.insert(lapak).values(data);
  const insertId = result[0].insertId;
  return typeof insertId === "bigint" ? Number(insertId) : insertId;
}

export async function updateLapak(
  id: number,
  villageId: number,
  data: Partial<NewLapak>,
): Promise<void> {
  await db
    .update(lapak)
    .set(data)
    .where(and(eq(lapak.id, id), eq(lapak.villageId, villageId)));
}

export async function deleteLapak(id: number, villageId: number): Promise<void> {
  await db.delete(lapak).where(and(eq(lapak.id, id), eq(lapak.villageId, villageId)));
}

export async function listKategoriLapak(villageId: number): Promise<string[]> {
  const rows = await db
    .selectDistinct({ kategori: lapak.kategori })
    .from(lapak)
    .where(and(eq(lapak.villageId, villageId)));
  return rows.map((r) => r.kategori).filter((k): k is string => k !== null && k !== "");
}
