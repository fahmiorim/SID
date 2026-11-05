import "server-only";

import { and, desc, eq, like, or } from "drizzle-orm";

import { db } from "@/db";
import { lapak, type Lapak, type NewLapak } from "@/db/schema/lapak";
import { residents } from "@/db/schema/resident";

export async function listLapak(
  villageId: number,
  opts?: { kategori?: string; q?: string },
): Promise<Lapak[]> {
  const where = [eq(lapak.villageId, villageId)];
  if (opts?.kategori) where.push(eq(lapak.kategori, opts.kategori));
  if (opts?.q) {
    where.push(
      or(
        like(lapak.nama, `%${opts.q}%`),
        like(lapak.pemilik ?? "", `%${opts.q}%`),
        like(lapak.alamat ?? "", `%${opts.q}%`),
        like(lapak.keterangan ?? "", `%${opts.q}%`),
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

/** Lapak milik satu warga (OS-WGA-010). */
export async function listLapakWarga(villageId: number, residentId: number): Promise<Lapak[]> {
  return db
    .select()
    .from(lapak)
    .where(and(eq(lapak.villageId, villageId), eq(lapak.residentId, residentId)))
    .orderBy(desc(lapak.id));
}

export async function findLapakWarga(
  villageId: number,
  residentId: number,
  id: number,
): Promise<Lapak | null> {
  const [row] = await db
    .select()
    .from(lapak)
    .where(and(eq(lapak.villageId, villageId), eq(lapak.residentId, residentId), eq(lapak.id, id)))
    .limit(1);
  return row ?? null;
}

export async function updateLapakWarga(
  id: number,
  villageId: number,
  residentId: number,
  data: Partial<NewLapak>,
): Promise<void> {
  await db
    .update(lapak)
    .set(data)
    .where(and(eq(lapak.id, id), eq(lapak.villageId, villageId), eq(lapak.residentId, residentId)));
}

export async function deleteLapakWarga(
  id: number,
  villageId: number,
  residentId: number,
): Promise<void> {
  await db
    .delete(lapak)
    .where(and(eq(lapak.id, id), eq(lapak.villageId, villageId), eq(lapak.residentId, residentId)));
}

/** Nama penduduk untuk kolom pemilik lapak. */
export async function namaPenduduk(villageId: number, residentId: number): Promise<string | null> {
  const [row] = await db
    .select({ nama: residents.name })
    .from(residents)
    .where(and(eq(residents.villageId, villageId), eq(residents.id, residentId)))
    .limit(1);
  return row?.nama ?? null;
}

export async function listKategoriLapak(villageId: number): Promise<string[]> {
  const rows = await db
    .selectDistinct({ kategori: lapak.kategori })
    .from(lapak)
    .where(and(eq(lapak.villageId, villageId)));
  return rows.map((r) => r.kategori).filter((k): k is string => k !== null && k !== "");
}
