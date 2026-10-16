import "server-only";

import { and, asc, count, eq, like, ne, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { wilayah } from "@/db/schema";
import type { WilayahDTO, WilayahFormInput } from "@/features/wilayah/domain/wilayah";

export interface WilayahListParams {
  configId: number;
  search: string;
  page: number;
  pageSize: number;
}

export interface WilayahListResult {
  rows: WilayahDTO[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

function toDto(row: typeof wilayah.$inferSelect): WilayahDTO {
  return {
    id: row.id,
    dusun: row.dusun ?? "",
    rw: row.rw ?? "",
    rt: row.rt ?? "",
    urut: row.urut ?? 0,
  };
}

function buildWhere(configId: number, search: string, excludeId?: number): SQL {
  const configFilter = eq(wilayah.configId, configId);
  const filters: SQL[] = [configFilter];

  if (search) {
    const term = `%${search}%`;
    const searchFilter = or(
      like(wilayah.dusun, term),
      like(wilayah.rw, term),
      like(wilayah.rt, term),
    );
    if (searchFilter) filters.push(searchFilter);
  }

  if (excludeId !== undefined) {
    filters.push(ne(wilayah.id, excludeId));
  }

  return and(...filters) ?? configFilter;
}

export async function listWilayah(params: WilayahListParams): Promise<WilayahListResult> {
  const { configId, search, page, pageSize } = params;
  const where = buildWhere(configId, search);

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(wilayah)
      .where(where)
      .orderBy(asc(wilayah.urut), asc(wilayah.dusun), asc(wilayah.rw), asc(wilayah.rt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(wilayah).where(where),
  ]);

  const total = totalRows[0]?.value ?? 0;

  return {
    rows: rows.map(toDto),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findWilayahById(configId: number, id: number): Promise<WilayahDTO | null> {
  const [row] = await db
    .select()
    .from(wilayah)
    .where(and(eq(wilayah.configId, configId), eq(wilayah.id, id)))
    .limit(1);

  return row ? toDto(row) : null;
}

/** Apakah kombinasi dusun/RW/RT sudah dipakai (kecuali `excludeId`). */
export async function wilayahExists(
  configId: number,
  input: WilayahFormInput,
  excludeId: number | null,
): Promise<boolean> {
  const filters: SQL[] = [
    eq(wilayah.configId, configId),
    eq(wilayah.dusun, input.dusun),
    eq(wilayah.rw, input.rw),
    eq(wilayah.rt, input.rt),
  ];

  if (excludeId !== null) {
    filters.push(ne(wilayah.id, excludeId));
  }

  const duplicates = await db
    .select({ id: wilayah.id })
    .from(wilayah)
    .where(and(...filters))
    .limit(1);

  return duplicates.length > 0;
}

export async function insertWilayah(configId: number, input: WilayahFormInput): Promise<number> {
  const [inserted] = await db
    .insert(wilayah)
    .values({
      configId,
      dusun: input.dusun,
      rw: input.rw,
      rt: input.rt,
      urut: input.urut,
    })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan data wilayah.");
  return inserted.id;
}

export async function updateWilayah(id: number, input: WilayahFormInput): Promise<void> {
  await db
    .update(wilayah)
    .set({ dusun: input.dusun, rw: input.rw, rt: input.rt, urut: input.urut })
    .where(eq(wilayah.id, id));
}

export async function deleteWilayah(id: number): Promise<void> {
  await db.delete(wilayah).where(eq(wilayah.id, id));
}
