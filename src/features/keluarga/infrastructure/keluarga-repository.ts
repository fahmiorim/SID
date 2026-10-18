import "server-only";

import { aliasedTable, and, asc, count, eq, like, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { families, familyRelations, regions, residents } from "@/db/schema";
import {
  HEAD_OF_FAMILY_RELATION_ID,
  type KeluargaDTO,
  type KeluargaFormInput,
  type KeluargaListRow,
  type KeluargaMember,
} from "@/features/keluarga/domain/keluarga";
import { formatWilayahLabel } from "@/features/wilayah/domain/wilayah";

/** Alias `residents` untuk mencari anggota yang berperan sebagai kepala keluarga. */
const head = aliasedTable(residents, "head");

export interface ListKeluargaParams {
  villageId: number;
  search: string;
  page: number;
  pageSize: number;
}

export interface KeluargaListResult {
  rows: KeluargaListRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Ubah teks kosong menjadi `NULL` agar basis data tidak menyimpan string kosong. */
function blankToNull(value: string): string | null {
  return value === "" ? null : value;
}

/** Petakan baris `families` → DTO domain (kosakata Indonesia). */
function toDto(row: typeof families.$inferSelect): KeluargaDTO {
  return {
    id: row.id,
    number: row.number,
    address: row.address,
    regionId: row.regionId,
  };
}

function formatRegionLabel(
  regionId: number | null,
  dusun: string | null,
  rw: string | null,
  rt: string | null,
): string | null {
  if (regionId === null) return null;
  return formatWilayahLabel({ dusun: dusun ?? "", rw: rw ?? "", rt: rt ?? "" });
}

function buildWhere(villageId: number, search: string): SQL {
  const villageFilter = eq(families.villageId, villageId);
  const filters: SQL[] = [villageFilter];

  if (search) {
    const term = `%${search}%`;
    const searchFilter = or(like(families.number, term), like(families.address, term));
    if (searchFilter) filters.push(searchFilter);
  }

  return and(...filters) ?? villageFilter;
}

/** Jumlah anggota KK, dihitung di basis data agar tidak ada query per baris. */
const memberCountExpr = sql<number>`(
  select count(*) from ${residents} where ${residents.familyId} = ${families.id}
)`;

export async function listKeluarga(params: ListKeluargaParams): Promise<KeluargaListResult> {
  const { villageId, search, page, pageSize } = params;
  const where = buildWhere(villageId, search);

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        family: families,
        headName: head.name,
        memberCount: memberCountExpr,
        dusun: regions.dusun,
        rw: regions.rw,
        rt: regions.rt,
      })
      .from(families)
      .leftJoin(
        head,
        and(eq(head.familyId, families.id), eq(head.familyRelationId, HEAD_OF_FAMILY_RELATION_ID)),
      )
      .leftJoin(regions, eq(families.regionId, regions.id))
      .where(where)
      .orderBy(asc(families.number), asc(families.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(families).where(where),
  ]);

  const total = totalRows[0]?.value ?? 0;

  return {
    rows: rows.map((row) => ({
      ...toDto(row.family),
      headName: row.headName ?? null,
      memberCount: Number(row.memberCount),
      regionLabel: formatRegionLabel(row.family.regionId, row.dusun, row.rw, row.rt),
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findKeluargaById(villageId: number, id: number): Promise<KeluargaDTO | null> {
  const [row] = await db
    .select()
    .from(families)
    .where(and(eq(families.villageId, villageId), eq(families.id, id)))
    .limit(1);

  return row ? toDto(row) : null;
}

/** Apakah nomor KK sudah dipakai keluarga lain di desa yang sama. */
export async function keluargaNumberExists(
  villageId: number,
  number: string,
  excludeId: number | null,
): Promise<boolean> {
  const filters: SQL[] = [eq(families.villageId, villageId), eq(families.number, number)];

  if (excludeId !== null) {
    filters.push(ne(families.id, excludeId));
  }

  const duplicates = await db
    .select({ id: families.id })
    .from(families)
    .where(and(...filters))
    .limit(1);

  return duplicates.length > 0;
}

/** Anggota sebuah KK, terurut dengan kepala keluarga di depan. */
export async function listKeluargaMembers(
  villageId: number,
  familyId: number,
): Promise<KeluargaMember[]> {
  const rows = await db
    .select({
      id: residents.id,
      name: residents.name,
      nationalId: residents.nationalId,
      gender: residents.gender,
      birthDate: residents.birthDate,
      relationName: familyRelations.name,
      familyRelationId: residents.familyRelationId,
    })
    .from(residents)
    .leftJoin(familyRelations, eq(residents.familyRelationId, familyRelations.id))
    .where(and(eq(residents.villageId, villageId), eq(residents.familyId, familyId)))
    .orderBy(asc(residents.name), asc(residents.id));

  return rows
    .sort((a, b) => {
      const aHead = a.familyRelationId === HEAD_OF_FAMILY_RELATION_ID ? 0 : 1;
      const bHead = b.familyRelationId === HEAD_OF_FAMILY_RELATION_ID ? 0 : 1;
      return aHead - bHead;
    })
    .map((row) => ({
      id: row.id,
      name: row.name,
      nationalId: row.nationalId,
      gender: row.gender,
      birthDate: row.birthDate,
      relationName: row.relationName ?? null,
    }));
}

export async function insertKeluarga(villageId: number, input: KeluargaFormInput): Promise<number> {
  const [inserted] = await db
    .insert(families)
    .values({
      villageId,
      number: input.number,
      address: blankToNull(input.address),
      regionId: input.regionId,
    })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan data keluarga.");
  return inserted.id;
}

export async function updateKeluarga(id: number, input: KeluargaFormInput): Promise<void> {
  await db
    .update(families)
    .set({
      number: input.number,
      address: blankToNull(input.address),
      regionId: input.regionId,
    })
    .where(eq(families.id, id));
}

/**
 * Hapus KK.
 *
 * Tautan penduduk dilepas otomatis oleh basis data (`ON DELETE SET NULL`),
 * sehingga data penduduk tidak ikut terhapus.
 */
export async function deleteKeluarga(id: number): Promise<void> {
  await db.delete(families).where(eq(families.id, id));
}
