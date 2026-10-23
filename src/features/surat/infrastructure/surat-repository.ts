import "server-only";

import { and, count, desc, eq, like, max, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { incomingLetters, letters, letterTypes, outgoingLetters, residents } from "@/db/schema";
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
  year: sql<number>`EXTRACT(YEAR FROM ${letters.letterDate})`,
  typeName: letters.typeName,
  typeCode: letterTypes.code,
  residentName: residents.name,
  purpose: letters.purpose,
  nilaiIsian: letters.nilaiIsian,
  createdAt: letters.createdAt,
  issuedAt: letters.issuedAt,
  verifikasiOperator: letters.verifikasiOperator,
  verifikasiSekdes: letters.verifikasiSekdes,
  verifikasiKades: letters.verifikasiKades,
  logVerifikasi: letters.logVerifikasi,
  catatanVerifikasi: letters.catatanVerifikasi,
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
      verificationToken: letters.verificationToken,
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
  /** JSON nilai isian dinamis. */
  nilaiIsian: string | null;
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
      nilaiIsian: input.nilaiIsian,
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
    /** JSON nilai isian dinamis. */
    nilaiIsian: string | null;
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
      nilaiIsian: input.nilaiIsian,
    })
    .where(and(eq(letters.villageId, villageId), eq(letters.id, id)));
}

export async function deleteSurat(villageId: number, id: number): Promise<void> {
  await db.delete(letters).where(and(eq(letters.villageId, villageId), eq(letters.id, id)));
}

export async function issueSuratRecord(
  villageId: number,
  id: number,
  input: {
    number: string;
    sequence: number;
    content: string;
    issuedAt: Date;
    logVerifikasi?: string | null;
    verificationToken?: string | null;
    verificationTokenHash?: string | null;
  },
): Promise<void> {
  await db
    .update(letters)
    .set({
      number: input.number,
      sequence: input.sequence,
      content: input.content,
      isiSurat: input.content,
      status: "issued",
      issuedAt: input.issuedAt,
      verifikasiKades: true,
      logVerifikasi: input.logVerifikasi ?? "kades",
      verificationToken: input.verificationToken ?? null,
      verificationTokenHash: input.verificationTokenHash ?? null,
    })
    .where(and(eq(letters.villageId, villageId), eq(letters.id, id)));
}

/**
 * Cari surat berdasarkan hash token verifikasi publik, ter-scope tenant.
 * Dipakai halaman `/desa/verifikasi-surat/[token]`. Token mentah tidak
 * dijadikan kunci pencarian; hash SHA-256 yang disimpan di DB dipakai agar
 * halaman publik tidak pernah menerima PK numerik surat.
 */
export async function findSuratByTokenHash(
  villageId: number,
  tokenHash: string,
): Promise<SuratDetail | null> {
  const [row] = await db
    .select({
      id: letters.id,
      typeId: letters.typeId,
      residentId: letters.residentId,
      number: letters.number,
      status: letters.status,
      letterDate: letters.letterDate,
      typeName: letters.typeName,
      typeCode: letterTypes.code,
      year: sql<number>`EXTRACT(YEAR FROM ${letters.letterDate})`,
      residentName: residents.name,
      purpose: letters.purpose,
      nilaiIsian: letters.nilaiIsian,
      content: letters.content,
      verificationToken: letters.verificationToken,
      createdAt: letters.createdAt,
      issuedAt: letters.issuedAt,
      verifikasiOperator: letters.verifikasiOperator,
      verifikasiSekdes: letters.verifikasiSekdes,
      verifikasiKades: letters.verifikasiKades,
      logVerifikasi: letters.logVerifikasi,
      catatanVerifikasi: letters.catatanVerifikasi,
    })
    .from(letters)
    .leftJoin(letterTypes, eq(letters.typeId, letterTypes.id))
    .leftJoin(residents, eq(letters.residentId, residents.id))
    .where(and(eq(letters.villageId, villageId), eq(letters.verificationTokenHash, tokenHash)))
    .limit(1);

  if (!row) return null;
  return { ...row, typeCode: row.typeCode ?? "" };
}

// Mode 2: per jenis surat
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

// Mode 1: seluruh surat layanan per tahun
export async function nextSuratSequenceGlobal(villageId: number, year: number): Promise<number> {
  const [row] = await db
    .select({ value: max(letters.sequence) })
    .from(letters)
    .where(and(eq(letters.villageId, villageId), eq(letters.year, year)));

  return Number(row?.value ?? 0) + 1;
}

// Mode 4: per klasifikasi surat
export async function nextSuratSequenceByKlasifikasi(
  villageId: number,
  classificationId: number,
  year: number,
): Promise<number> {
  const [row] = await db
    .select({ value: max(letters.sequence) })
    .from(letters)
    .leftJoin(letterTypes, eq(letters.typeId, letterTypes.id))
    .where(
      and(
        eq(letters.villageId, villageId),
        eq(letterTypes.classificationId, classificationId),
        eq(letters.year, year),
      ),
    );

  return Number(row?.value ?? 0) + 1;
}

// Mode 3: gabungan log_surat, surat_masuk, surat_keluar (maksimum nomor urut)
export async function nextSuratSequenceCombined(villageId: number, year: number): Promise<number> {
  const [rowLetters] = await db
    .select({ value: max(letters.sequence) })
    .from(letters)
    .where(and(eq(letters.villageId, villageId), eq(letters.year, year)));

  const [rowIncoming] = await db
    .select({ value: max(incomingLetters.agendaNumber) })
    .from(incomingLetters)
    .where(eq(incomingLetters.villageId, villageId));

  const [rowOutgoing] = await db
    .select({ value: max(outgoingLetters.agendaNumber) })
    .from(outgoingLetters)
    .where(eq(outgoingLetters.villageId, villageId));

  const maxSeq = Math.max(
    Number(rowLetters?.value ?? 0),
    Number(rowIncoming?.value ?? 0),
    Number(rowOutgoing?.value ?? 0),
  );

  return maxSeq + 1;
}

export async function suratNumberExists(villageId: number, number: string): Promise<boolean> {
  const rows = await db
    .select({ id: letters.id })
    .from(letters)
    .where(and(eq(letters.villageId, villageId), eq(letters.number, number)))
    .limit(1);

  return rows.length > 0;
}

// Deteksi duplikat lintas agenda (mode 3)
export async function suratNumberExistsWithAgenda(
  villageId: number,
  number: string,
): Promise<boolean> {
  const [rowLetters] = await db
    .select({ id: letters.id })
    .from(letters)
    .where(and(eq(letters.villageId, villageId), eq(letters.number, number)))
    .limit(1);

  if (rowLetters) return true;

  const [rowIncoming] = await db
    .select({ id: incomingLetters.id })
    .from(incomingLetters)
    .where(and(eq(incomingLetters.villageId, villageId), eq(incomingLetters.letterNumber, number)))
    .limit(1);

  if (rowIncoming) return true;

  const [rowOutgoing] = await db
    .select({ id: outgoingLetters.id })
    .from(outgoingLetters)
    .where(and(eq(outgoingLetters.villageId, villageId), eq(outgoingLetters.letterNumber, number)))
    .limit(1);

  if (rowOutgoing) return true;

  return false;
}

// Verifikasi berjenjang
export async function updateSuratVerification(
  villageId: number,
  id: number,
  input: {
    verifikasiOperator?: boolean | null;
    verifikasiSekdes?: boolean | null;
    verifikasiKades?: boolean | null;
    logVerifikasi?: string | null;
    catatanVerifikasi?: string | null;
    tte?: boolean | null;
    status?: LetterStatus;
  },
): Promise<void> {
  await db
    .update(letters)
    .set(input)
    .where(and(eq(letters.villageId, villageId), eq(letters.id, id)));
}

export async function rejectSurat(villageId: number, id: number, reason: string): Promise<void> {
  await db
    .update(letters)
    .set({
      verifikasiOperator: null,
      verifikasiSekdes: null,
      verifikasiKades: null,
      logVerifikasi: "ditolak",
      catatanVerifikasi: reason,
      status: "draft",
    })
    .where(and(eq(letters.villageId, villageId), eq(letters.id, id)));
}
