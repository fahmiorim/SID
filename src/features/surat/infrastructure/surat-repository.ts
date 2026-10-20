import "server-only";

import { and, count, desc, eq, like, max, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { letters, letterTypes, residents } from "@/db/schema";
import type { LetterStatus, SuratDetail, SuratListRow } from "@/features/surat/domain/surat";

export interface ListSuratParams {
  villageId: number;
  search: string;
  status: LetterStatus | null;
}

export interface SuratListResult {
  rows: SuratListRow[];
  total: number;
}

const listColumns = {
  id: letters.id,
  typeId: letters.typeId,
  residentId: letters.residentId,
  number: letters.number,
  status: letters.status,
  letterDate: letters.letterDate,
  typeName: letters.typeName,
  typeCode: letterTypes.code,
  residentName: residents.name,
  purpose: letters.purpose,
  createdAt: letters.createdAt,
  issuedAt: letters.issuedAt,
};

function buildWhere(villageId: number, search: string, status: LetterStatus | null): SQL {
  const villageFilter = eq(letters.villageId, villageId);
  const filters: SQL[] = [villageFilter];

  if (search) {
    const term = `%${search}%`;
    const searchFilter = or(
      like(letters.number, term),
      like(letters.typeName, term),
      like(letters.purpose, term),
      like(residents.name, term),
    );
    if (searchFilter) filters.push(searchFilter);
  }

  if (status) filters.push(eq(letters.status, status));

  return and(...filters) ?? villageFilter;
}

export async function listSurat(params: ListSuratParams): Promise<SuratListResult> {
  const { villageId, search, status } = params;
  const where = buildWhere(villageId, search, status);

  const [rows, totalRows] = await Promise.all([
    db
      .select(listColumns)
      .from(letters)
      .leftJoin(letterTypes, eq(letters.typeId, letterTypes.id))
      .leftJoin(residents, eq(letters.residentId, residents.id))
      .where(where)
      .orderBy(desc(letters.createdAt), desc(letters.id))
      .limit(200),
    db
      .select({ value: count() })
      .from(letters)
      .leftJoin(letterTypes, eq(letters.typeId, letterTypes.id))
      .leftJoin(residents, eq(letters.residentId, residents.id))
      .where(where),
  ]);

  return {
    rows: rows.map((row) => ({
      ...row,
      typeCode: row.typeCode ?? "",
    })),
    total: totalRows[0]?.value ?? 0,
  };
}

export interface SuratRecapRow {
  status: LetterStatus;
  total: number;
}

/** Jumlah surat per status pada desa ini (untuk rekapitulasi). */
export async function recapSuratByStatus(villageId: number): Promise<SuratRecapRow[]> {
  const rows = await db
    .select({ status: letters.status, total: count() })
    .from(letters)
    .where(eq(letters.villageId, villageId))
    .groupBy(letters.status);

  return rows;
}

export async function getSurat(villageId: number, id: number): Promise<SuratDetail | null> {
  const [row] = await db
    .select({
      ...listColumns,
      content: letters.content,
    })
    .from(letters)
    .leftJoin(letterTypes, eq(letters.typeId, letterTypes.id))
    .leftJoin(residents, eq(letters.residentId, residents.id))
    .where(and(eq(letters.villageId, villageId), eq(letters.id, id)))
    .limit(1);

  if (!row) return null;
  return {
    ...row,
    typeCode: row.typeCode ?? "",
  };
}

export async function createSuratDraft(input: {
  villageId: number;
  typeId: number;
  residentId: number | null;
  letterDate: string;
  year: number;
  purpose: string;
  typeName: string;
  createdBy: string;
}): Promise<number> {
  const [inserted] = await db
    .insert(letters)
    .values({
      villageId: input.villageId,
      typeId: input.typeId,
      residentId: input.residentId,
      letterDate: input.letterDate,
      year: input.year,
      purpose: input.purpose,
      typeName: input.typeName,
      createdBy: input.createdBy,
      status: "draft",
    })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan konsep surat.");
  return inserted.id;
}

export async function updateSuratDraft(
  villageId: number,
  id: number,
  input: {
    typeId: number;
    residentId: number | null;
    letterDate: string;
    year: number;
    purpose: string;
    typeName: string;
  },
): Promise<void> {
  await db
    .update(letters)
    .set({
      typeId: input.typeId,
      residentId: input.residentId,
      letterDate: input.letterDate,
      year: input.year,
      purpose: input.purpose,
      typeName: input.typeName,
    })
    .where(and(eq(letters.villageId, villageId), eq(letters.id, id)));
}

export async function deleteSurat(villageId: number, id: number): Promise<void> {
  await db.delete(letters).where(and(eq(letters.villageId, villageId), eq(letters.id, id)));
}

export async function issueSuratRecord(
  id: number,
  input: {
    number: string;
    sequence: number;
    content: string;
    issuedAt: Date;
  },
): Promise<void> {
  await db
    .update(letters)
    .set({
      number: input.number,
      sequence: input.sequence,
      content: input.content,
      status: "issued",
      issuedAt: input.issuedAt,
    })
    .where(eq(letters.id, id));
}

export async function nextSuratSequence(
  villageId: number,
  typeId: number,
  year: number,
): Promise<number> {
  const [row] = await db
    .select({ value: max(letters.sequence) })
    .from(letters)
    .where(
      and(eq(letters.villageId, villageId), eq(letters.typeId, typeId), eq(letters.year, year)),
    );

  return Number(row?.value ?? 0) + 1;
}

export async function suratNumberExists(villageId: number, number: string): Promise<boolean> {
  const rows = await db
    .select({ id: letters.id })
    .from(letters)
    .where(and(eq(letters.villageId, villageId), eq(letters.number, number)))
    .limit(1);

  return rows.length > 0;
}
