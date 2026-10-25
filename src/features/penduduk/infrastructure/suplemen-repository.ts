import "server-only";

import { and, count, desc, eq, ilike, sql } from "drizzle-orm";

import { db } from "@/db";
import { suplemen } from "@/db/schema";
import {
  type ListSuplemenParams,
  type ListSuplemenResult,
  type SuplemenCreateInput,
  type SuplemenUpdateInput,
} from "@/features/penduduk/domain/suplemen";
import { slugify } from "@/lib/utils";

export async function listSuplemen(
  villageId: number,
  params: ListSuplemenParams,
): Promise<ListSuplemenResult> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 10));
  const offset = (page - 1) * perPage;

  const filters = [eq(suplemen.villageId, villageId)];
  if (params.search) {
    filters.push(ilike(suplemen.nama, `%${params.search}%`));
  }
  if (params.sasaran) {
    filters.push(eq(suplemen.sasaran, params.sasaran));
  }

  const where = and(...filters);

  const [totalRes, rows] = await Promise.all([
    db.select({ value: count() }).from(suplemen).where(where),
    db
      .select({
        id: suplemen.id,
        nama: suplemen.nama,
        slug: suplemen.slug,
        sasaran: suplemen.sasaran,
        keterangan: suplemen.keterangan,
        updatedAt: suplemen.updatedAt,
        terdataCount: sql<number>`(SELECT COUNT(*) FROM suplemen_terdata WHERE suplemen_terdata.id_suplemen = suplemen.id)`,
      })
      .from(suplemen)
      .where(where)
      .orderBy(desc(suplemen.updatedAt))
      .limit(perPage)
      .offset(offset),
  ]);

  const total = totalRes[0]?.value ?? 0;

  return {
    rows: rows.map((r) => ({
      ...r,
      updatedAt: r.updatedAt.toISOString(),
    })),
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function createSuplemen(
  villageId: number,
  input: SuplemenCreateInput,
): Promise<number> {
  const slug = slugify(input.nama);
  const [created] = await db.insert(suplemen).values({
    villageId,
    nama: input.nama,
    slug,
    sasaran: input.sasaran,
    keterangan: input.keterangan,
  });
  return Number(created.insertId);
}

export async function updateSuplemen(villageId: number, input: SuplemenUpdateInput): Promise<void> {
  const slug = slugify(input.nama);
  await db
    .update(suplemen)
    .set({
      nama: input.nama,
      slug,
      sasaran: input.sasaran,
      keterangan: input.keterangan,
    })
    .where(and(eq(suplemen.id, input.id), eq(suplemen.villageId, villageId)));
}

export async function deleteSuplemen(villageId: number, id: number): Promise<void> {
  await db.delete(suplemen).where(and(eq(suplemen.id, id), eq(suplemen.villageId, villageId)));
}
