import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { idmIndikator } from "@/db/schema";

export async function listIdm(villageId: number, tahun?: number) {
  const where = tahun
    ? and(eq(idmIndikator.villageId, villageId), eq(idmIndikator.tahun, tahun))
    : eq(idmIndikator.villageId, villageId);
  return db.select().from(idmIndikator).where(where).orderBy(idmIndikator.kode);
}

export async function createIdm(data: typeof idmIndikator.$inferInsert) {
  const result = await db.insert(idmIndikator).values(data).$returningId();
  return result[0]?.id ?? 0;
}

export async function updateIdm(
  id: number,
  villageId: number,
  data: Partial<typeof idmIndikator.$inferInsert>,
) {
  await db
    .update(idmIndikator)
    .set(data)
    .where(and(eq(idmIndikator.id, id), eq(idmIndikator.villageId, villageId)));
}

export async function deleteIdm(id: number, villageId: number) {
  await db
    .delete(idmIndikator)
    .where(and(eq(idmIndikator.id, id), eq(idmIndikator.villageId, villageId)));
}
