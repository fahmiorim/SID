import "server-only";

import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { pelanggan, type NewPelanggan, type Pelanggan } from "@/db/schema/pelanggan";

export async function listPelanggan(
  villageId: number,
  opts?: { q?: string },
): Promise<Pelanggan[]> {
  const where = [eq(pelanggan.villageId, villageId)];
  if (opts?.q) {
    where.push(
      or(
        ilike(pelanggan.nama, `%${opts.q}%`),
        ilike(pelanggan.kontak ?? "", `%${opts.q}%`),
        ilike(pelanggan.alamat ?? "", `%${opts.q}%`),
        ilike(pelanggan.keterangan ?? "", `%${opts.q}%`),
      )!,
    );
  }
  return db
    .select()
    .from(pelanggan)
    .where(and(...where))
    .orderBy(desc(pelanggan.id));
}

export async function createPelanggan(data: NewPelanggan): Promise<number> {
  const result = await db.insert(pelanggan).values(data);
  const insertId = result[0].insertId;
  return typeof insertId === "bigint" ? Number(insertId) : insertId;
}

export async function updatePelanggan(
  id: number,
  villageId: number,
  data: Partial<NewPelanggan>,
): Promise<void> {
  await db
    .update(pelanggan)
    .set(data)
    .where(and(eq(pelanggan.id, id), eq(pelanggan.villageId, villageId)));
}

export async function deletePelanggan(id: number, villageId: number): Promise<void> {
  await db.delete(pelanggan).where(and(eq(pelanggan.id, id), eq(pelanggan.villageId, villageId)));
}
