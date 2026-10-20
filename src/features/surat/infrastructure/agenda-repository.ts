import "server-only";

import { and, desc, eq, like, max, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { incomingLetters, letterClassifications, outgoingLetters } from "@/db/schema";
import type {
  SuratKeluarDTO,
  SuratKeluarInput,
  SuratMasukDTO,
  SuratMasukInput,
} from "@/features/surat/domain/surat";

// --- Surat masuk -----------------------------------------------------------

const masukColumns = {
  id: incomingLetters.id,
  agendaNumber: incomingLetters.agendaNumber,
  receivedDate: incomingLetters.receivedDate,
  letterNumber: incomingLetters.letterNumber,
  letterDate: incomingLetters.letterDate,
  sender: incomingLetters.sender,
  classificationId: incomingLetters.classificationId,
  classificationName: letterClassifications.name,
  summary: incomingLetters.summary,
  disposition: incomingLetters.disposition,
  archiveLocation: incomingLetters.archiveLocation,
};

function masukWhere(villageId: number, search: string): SQL {
  const base = eq(incomingLetters.villageId, villageId);
  if (!search) return base;

  const term = `%${search}%`;
  return (
    and(
      base,
      or(
        like(incomingLetters.letterNumber, term),
        like(incomingLetters.sender, term),
        like(incomingLetters.summary, term),
      ),
    ) ?? base
  );
}

export async function listSuratMasuk(villageId: number, search: string): Promise<SuratMasukDTO[]> {
  const rows = await db
    .select(masukColumns)
    .from(incomingLetters)
    .leftJoin(letterClassifications, eq(incomingLetters.classificationId, letterClassifications.id))
    .where(masukWhere(villageId, search))
    .orderBy(desc(incomingLetters.receivedDate), desc(incomingLetters.id))
    .limit(200);

  return rows;
}

export async function getSuratMasuk(villageId: number, id: number): Promise<SuratMasukDTO | null> {
  const [row] = await db
    .select(masukColumns)
    .from(incomingLetters)
    .leftJoin(letterClassifications, eq(incomingLetters.classificationId, letterClassifications.id))
    .where(and(eq(incomingLetters.villageId, villageId), eq(incomingLetters.id, id)))
    .limit(1);

  return row ?? null;
}

/** Nomor agenda berikutnya (maksimum + 1) pada tahun buku berjalan. */
export async function nextAgendaNumberMasuk(villageId: number): Promise<number> {
  const [row] = await db
    .select({ value: max(incomingLetters.agendaNumber) })
    .from(incomingLetters)
    .where(eq(incomingLetters.villageId, villageId));

  return Number(row?.value ?? 0) + 1;
}

export async function createSuratMasuk(villageId: number, input: SuratMasukInput): Promise<number> {
  const [inserted] = await db
    .insert(incomingLetters)
    .values({
      villageId,
      agendaNumber: input.agendaNumber,
      receivedDate: input.receivedDate,
      letterNumber: input.letterNumber,
      letterDate: input.letterDate,
      sender: input.sender,
      classificationId: input.classificationId,
      summary: input.summary,
      disposition: input.disposition,
      archiveLocation: input.archiveLocation,
    })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan surat masuk.");
  return inserted.id;
}

export async function updateSuratMasuk(
  villageId: number,
  id: number,
  input: SuratMasukInput,
): Promise<void> {
  await db
    .update(incomingLetters)
    .set({
      agendaNumber: input.agendaNumber,
      receivedDate: input.receivedDate,
      letterNumber: input.letterNumber,
      letterDate: input.letterDate,
      sender: input.sender,
      classificationId: input.classificationId,
      summary: input.summary,
      disposition: input.disposition,
      archiveLocation: input.archiveLocation,
    })
    .where(and(eq(incomingLetters.villageId, villageId), eq(incomingLetters.id, id)));
}

export async function deleteSuratMasuk(villageId: number, id: number): Promise<void> {
  await db
    .delete(incomingLetters)
    .where(and(eq(incomingLetters.villageId, villageId), eq(incomingLetters.id, id)));
}

// --- Surat keluar ----------------------------------------------------------

const keluarColumns = {
  id: outgoingLetters.id,
  agendaNumber: outgoingLetters.agendaNumber,
  letterNumber: outgoingLetters.letterNumber,
  letterDate: outgoingLetters.letterDate,
  recipient: outgoingLetters.recipient,
  classificationId: outgoingLetters.classificationId,
  classificationName: letterClassifications.name,
  summary: outgoingLetters.summary,
  sentDate: outgoingLetters.sentDate,
  archiveLocation: outgoingLetters.archiveLocation,
};

function keluarWhere(villageId: number, search: string): SQL {
  const base = eq(outgoingLetters.villageId, villageId);
  if (!search) return base;

  const term = `%${search}%`;
  return (
    and(
      base,
      or(
        like(outgoingLetters.letterNumber, term),
        like(outgoingLetters.recipient, term),
        like(outgoingLetters.summary, term),
      ),
    ) ?? base
  );
}

export async function listSuratKeluar(
  villageId: number,
  search: string,
): Promise<SuratKeluarDTO[]> {
  return db
    .select(keluarColumns)
    .from(outgoingLetters)
    .leftJoin(letterClassifications, eq(outgoingLetters.classificationId, letterClassifications.id))
    .where(keluarWhere(villageId, search))
    .orderBy(desc(outgoingLetters.letterDate), desc(outgoingLetters.id))
    .limit(200);
}

export async function getSuratKeluar(
  villageId: number,
  id: number,
): Promise<SuratKeluarDTO | null> {
  const [row] = await db
    .select(keluarColumns)
    .from(outgoingLetters)
    .leftJoin(letterClassifications, eq(outgoingLetters.classificationId, letterClassifications.id))
    .where(and(eq(outgoingLetters.villageId, villageId), eq(outgoingLetters.id, id)))
    .limit(1);

  return row ?? null;
}

/** Nomor agenda berikutnya (maksimum + 1) untuk surat keluar. */
export async function nextAgendaNumberKeluar(villageId: number): Promise<number> {
  const [row] = await db
    .select({ value: max(outgoingLetters.agendaNumber) })
    .from(outgoingLetters)
    .where(eq(outgoingLetters.villageId, villageId));

  return Number(row?.value ?? 0) + 1;
}

export async function createSuratKeluar(
  villageId: number,
  input: SuratKeluarInput,
): Promise<number> {
  const [inserted] = await db
    .insert(outgoingLetters)
    .values({
      villageId,
      agendaNumber: input.agendaNumber,
      letterNumber: input.letterNumber,
      letterDate: input.letterDate,
      recipient: input.recipient,
      classificationId: input.classificationId,
      summary: input.summary,
      sentDate: input.sentDate,
      archiveLocation: input.archiveLocation,
    })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan surat keluar.");
  return inserted.id;
}

export async function updateSuratKeluar(
  villageId: number,
  id: number,
  input: SuratKeluarInput,
): Promise<void> {
  await db
    .update(outgoingLetters)
    .set({
      agendaNumber: input.agendaNumber,
      letterNumber: input.letterNumber,
      letterDate: input.letterDate,
      recipient: input.recipient,
      classificationId: input.classificationId,
      summary: input.summary,
      sentDate: input.sentDate,
      archiveLocation: input.archiveLocation,
    })
    .where(and(eq(outgoingLetters.villageId, villageId), eq(outgoingLetters.id, id)));
}

export async function deleteSuratKeluar(villageId: number, id: number): Promise<void> {
  await db
    .delete(outgoingLetters)
    .where(and(eq(outgoingLetters.villageId, villageId), eq(outgoingLetters.id, id)));
}
