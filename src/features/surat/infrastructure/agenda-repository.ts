import "server-only";

import { and, desc, eq, like, max, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import {
  incomingLetterDispositions,
  incomingLetters,
  letterAgendaLogs,
  letterClassifications,
  outgoingLetters,
  outgoingLetterShipments,
} from "@/db/schema";
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

export async function listDisposisiSuratMasuk(villageId: number, incomingLetterId: number) {
  return db
    .select()
    .from(incomingLetterDispositions)
    .where(
      and(
        eq(incomingLetterDispositions.villageId, villageId),
        eq(incomingLetterDispositions.incomingLetterId, incomingLetterId),
      ),
    )
    .orderBy(desc(incomingLetterDispositions.createdAt));
}

export async function tambahDisposisiSuratMasuk(
  villageId: number,
  incomingLetterId: number,
  input: {
    toUserId?: string | null;
    toRole?: string | null;
    instruction: string;
    dueDate?: string | null;
    note?: string | null;
    dispatchedBy?: string | null;
  },
) {
  const [row] = await db
    .insert(incomingLetterDispositions)
    .values({
      villageId,
      incomingLetterId,
      toUserId: input.toUserId ?? null,
      toRole: input.toRole ?? null,
      instruction: input.instruction,
      dueDate: input.dueDate ?? null,
      note: input.note ?? null,
      dispatchedBy: input.dispatchedBy ?? null,
      status: "pending",
    })
    .$returningId();
  return row?.id;
}

export async function listEkspedisiSuratKeluar(villageId: number, outgoingLetterId: number) {
  return db
    .select()
    .from(outgoingLetterShipments)
    .where(
      and(
        eq(outgoingLetterShipments.villageId, villageId),
        eq(outgoingLetterShipments.outgoingLetterId, outgoingLetterId),
      ),
    )
    .orderBy(desc(outgoingLetterShipments.sentDate), desc(outgoingLetterShipments.id));
}

export async function tambahEkspedisiSuratKeluar(
  villageId: number,
  outgoingLetterId: number,
  input: {
    sentDate: string;
    recipient?: string | null;
    deliveryMethod?: string | null;
    trackingNo?: string | null;
    note?: string | null;
  },
) {
  const [row] = await db
    .insert(outgoingLetterShipments)
    .values({
      villageId,
      outgoingLetterId,
      sentDate: input.sentDate,
      recipient: input.recipient ?? null,
      deliveryMethod: input.deliveryMethod ?? null,
      trackingNo: input.trackingNo ?? null,
      note: input.note ?? null,
    })
    .$returningId();
  return row?.id;
}

export async function catatLogAgenda(
  villageId: number,
  input: {
    type: "masuk" | "keluar";
    letterId: number;
    action: string;
    note?: string | null;
    actorId?: string | null;
  },
) {
  await db.insert(letterAgendaLogs).values({
    villageId,
    type: input.type,
    letterId: input.letterId,
    action: input.action,
    note: input.note ?? null,
    actorId: input.actorId ?? null,
  });
}

export async function listLogAgenda(villageId: number, type: "masuk" | "keluar", letterId: number) {
  return db
    .select()
    .from(letterAgendaLogs)
    .where(
      and(
        eq(letterAgendaLogs.villageId, villageId),
        eq(letterAgendaLogs.type, type),
        eq(letterAgendaLogs.letterId, letterId),
      ),
    )
    .orderBy(desc(letterAgendaLogs.createdAt));
}
