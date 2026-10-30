import { and, eq, like } from "drizzle-orm";

import { db } from "@/db";
import { rentangUmur } from "@/db/schema/rentang-umur";
import {
  rentangUmurFormSchema,
  type RentangUmurDTO,
  type RentangUmurFormInput,
} from "@/features/statistik/domain/rentang-umur";
import { mapRentangUmurRow } from "@/features/statistik/infrastructure/rentang-umur-repository";
import { requirePermission } from "@/lib/dal";

export interface ListRentangUmurParams {
  villageId: number;
  search?: string;
}

export async function listRentangUmurUseCase(
  params: ListRentangUmurParams,
): Promise<RentangUmurDTO[]> {
  await requirePermission("statistik", "read");

  const whereCond = params.search
    ? and(eq(rentangUmur.villageId, params.villageId), like(rentangUmur.nama, `%${params.search}%`))
    : eq(rentangUmur.villageId, params.villageId);

  const rows = await db.select().from(rentangUmur).where(whereCond).orderBy(rentangUmur.dari);

  return rows.map(mapRentangUmurRow);
}

export async function createRentangUmurUseCase(
  villageId: number,
  input: RentangUmurFormInput,
): Promise<{ id: number }> {
  await requirePermission("statistik", "update");

  const validated = rentangUmurFormSchema.parse(input);

  const inserted = await db
    .insert(rentangUmur)
    .values({
      villageId,
      nama: validated.nama,
      dari: validated.dari,
      sampai: validated.sampai,
      status: true,
    })
    .$returningId();

  if (!inserted[0]) throw new Error("Gagal membuat rentang umur.");

  return { id: inserted[0].id };
}

export async function updateRentangUmurUseCase(
  villageId: number,
  id: number,
  input: RentangUmurFormInput,
): Promise<void> {
  await requirePermission("statistik", "update");

  const validated = rentangUmurFormSchema.parse(input);

  const [result] = await db
    .update(rentangUmur)
    .set({
      nama: validated.nama,
      dari: validated.dari,
      sampai: validated.sampai,
    })
    .where(and(eq(rentangUmur.id, id), eq(rentangUmur.villageId, villageId)));

  if (!result || result.affectedRows === 0) throw new Error("Rentang umur tidak ditemukan.");
}

export async function deleteRentangUmurUseCase(villageId: number, id: number): Promise<void> {
  await requirePermission("statistik", "delete");

  const [result] = await db
    .delete(rentangUmur)
    .where(and(eq(rentangUmur.id, id), eq(rentangUmur.villageId, villageId)));

  if (!result || result.affectedRows === 0) throw new Error("Rentang umur tidak ditemukan.");
}
