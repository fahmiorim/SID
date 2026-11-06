import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { umpanBalik } from "@/db/schema";
import type { UmpanBalikInput, UmpanBalikStatus } from "@/features/umpan-balik/domain/umpan-balik";

export interface UmpanBalikRow {
  id: number;
  nama: string | null;
  kontak: string | null;
  pesan: string;
  status: string;
  createdAt: Date;
}

export async function insertUmpanBalik(villageId: number, input: UmpanBalikInput): Promise<number> {
  const [row] = await db
    .insert(umpanBalik)
    .values({
      villageId,
      nama: input.nama === "" ? null : input.nama,
      kontak: input.kontak === "" ? null : input.kontak,
      pesan: input.pesan,
    })
    .$returningId();

  if (!row) throw new Error("Gagal menyimpan umpan balik.");
  return row.id;
}

/** Daftar umpan balik desa, terbaru lebih dulu; `status` kosong = semua. */
export async function listUmpanBalik(
  villageId: number,
  filter: { status?: string; limit?: number } = {},
): Promise<UmpanBalikRow[]> {
  const conditions = [eq(umpanBalik.villageId, villageId)];
  if (filter.status) conditions.push(eq(umpanBalik.status, filter.status));

  const rows = await db
    .select({
      id: umpanBalik.id,
      nama: umpanBalik.nama,
      kontak: umpanBalik.kontak,
      pesan: umpanBalik.pesan,
      status: umpanBalik.status,
      createdAt: umpanBalik.createdAt,
    })
    .from(umpanBalik)
    .where(and(...conditions))
    .orderBy(desc(umpanBalik.createdAt), desc(umpanBalik.id))
    .limit(Math.min(Math.max(filter.limit ?? 200, 1), 500));

  return rows;
}

/** Ubah status satu baris; false bila tidak ditemukan di desa ini. */
export async function updateStatusUmpanBalik(
  villageId: number,
  id: number,
  status: UmpanBalikStatus,
): Promise<boolean> {
  const [result] = await db
    .update(umpanBalik)
    .set({ status })
    .where(and(eq(umpanBalik.villageId, villageId), eq(umpanBalik.id, id)));

  return result.affectedRows > 0;
}
