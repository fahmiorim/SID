import "server-only";

import { and, desc, eq, like, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { letterClassifications, letterDinas } from "@/db/schema";
import type { SuratDinasDTO, SuratDinasInput } from "@/features/surat/domain/surat";

// --- Surat dinas (Fase 2E) ---------------------------------------------------
//
// Buku surat dinas antar instansi. Berbeda dari agenda masuk/keluar, tidak ada
// nomor agenda dan alur suratnya sederhana (tanpa verifikasi berjenjang).

const dinasColumns = {
  id: letterDinas.id,
  letterNumber: letterDinas.letterNumber,
  letterDate: letterDinas.letterDate,
  recipient: letterDinas.recipient,
  recipientAddress: letterDinas.recipientAddress,
  subject: letterDinas.subject,
  content: letterDinas.content,
  classificationId: letterDinas.classificationId,
  classificationName: letterClassifications.name,
  archiveFile: letterDinas.archiveFile,
  archiveLocation: letterDinas.archiveLocation,
};

function dinasWhere(villageId: number, search: string): SQL {
  const base = eq(letterDinas.villageId, villageId);
  if (!search) return base;

  const term = `%${search}%`;
  return (
    and(
      base,
      or(
        like(letterDinas.letterNumber, term),
        like(letterDinas.recipient, term),
        like(letterDinas.subject, term),
      ),
    ) ?? base
  );
}

export async function listSuratDinas(villageId: number, search: string): Promise<SuratDinasDTO[]> {
  return db
    .select(dinasColumns)
    .from(letterDinas)
    .leftJoin(letterClassifications, eq(letterDinas.classificationId, letterClassifications.id))
    .where(dinasWhere(villageId, search))
    .orderBy(desc(letterDinas.letterDate), desc(letterDinas.id))
    .limit(200);
}

export async function getSuratDinas(villageId: number, id: number): Promise<SuratDinasDTO | null> {
  const [row] = await db
    .select(dinasColumns)
    .from(letterDinas)
    .leftJoin(letterClassifications, eq(letterDinas.classificationId, letterClassifications.id))
    .where(and(eq(letterDinas.villageId, villageId), eq(letterDinas.id, id)))
    .limit(1);

  return row ?? null;
}

function isiDinas(input: SuratDinasInput) {
  return {
    letterNumber: input.letterNumber,
    letterDate: input.letterDate,
    recipient: input.recipient,
    recipientAddress: input.recipientAddress,
    subject: input.subject,
    content: input.content,
    classificationId: input.classificationId,
    // Jalur kosong diulah menjadi NULL agar kolom DB tetap semantik.
    archiveFile: input.archiveFile && input.archiveFile.trim() !== "" ? input.archiveFile : null,
    archiveLocation: input.archiveLocation,
  };
}

export async function createSuratDinas(villageId: number, input: SuratDinasInput): Promise<number> {
  const [inserted] = await db
    .insert(letterDinas)
    .values({ villageId, ...isiDinas(input) })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan surat dinas.");
  return inserted.id;
}

export async function updateSuratDinas(
  villageId: number,
  id: number,
  input: SuratDinasInput,
): Promise<void> {
  await db
    .update(letterDinas)
    .set(isiDinas(input))
    .where(and(eq(letterDinas.villageId, villageId), eq(letterDinas.id, id)));
}

export async function deleteSuratDinas(villageId: number, id: number): Promise<void> {
  await db
    .delete(letterDinas)
    .where(and(eq(letterDinas.villageId, villageId), eq(letterDinas.id, id)));
}
