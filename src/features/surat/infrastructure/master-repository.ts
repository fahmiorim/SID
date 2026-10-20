import "server-only";

import { and, asc, count, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { letterClassifications, letters, letterTypes } from "@/db/schema";
import type {
  JenisSuratDTO,
  JenisSuratInput,
  KlasifikasiSuratDTO,
  KlasifikasiSuratInput,
} from "@/features/surat/domain/surat";

// --- Klasifikasi -----------------------------------------------------------

const klasifikasiColumns = {
  id: letterClassifications.id,
  code: letterClassifications.code,
  name: letterClassifications.name,
};

export async function listKlasifikasi(villageId: number): Promise<KlasifikasiSuratDTO[]> {
  return db
    .select(klasifikasiColumns)
    .from(letterClassifications)
    .where(eq(letterClassifications.villageId, villageId))
    .orderBy(asc(letterClassifications.code), asc(letterClassifications.name));
}

export async function getKlasifikasi(
  villageId: number,
  id: number,
): Promise<KlasifikasiSuratDTO | null> {
  const [row] = await db
    .select(klasifikasiColumns)
    .from(letterClassifications)
    .where(and(eq(letterClassifications.villageId, villageId), eq(letterClassifications.id, id)))
    .limit(1);

  return row ?? null;
}

export async function klasifikasiExists(
  villageId: number,
  code: string,
  excludeId: number | null,
): Promise<boolean> {
  const filters = [
    eq(letterClassifications.villageId, villageId),
    eq(letterClassifications.code, code),
  ];
  if (excludeId !== null) filters.push(ne(letterClassifications.id, excludeId));

  const rows = await db
    .select({ id: letterClassifications.id })
    .from(letterClassifications)
    .where(and(...filters))
    .limit(1);

  return rows.length > 0;
}

export async function createKlasifikasi(
  villageId: number,
  input: KlasifikasiSuratInput,
): Promise<number> {
  const [inserted] = await db
    .insert(letterClassifications)
    .values({ villageId, code: input.code, name: input.name })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan klasifikasi surat.");
  return inserted.id;
}

export async function updateKlasifikasi(
  villageId: number,
  id: number,
  input: KlasifikasiSuratInput,
): Promise<void> {
  await db
    .update(letterClassifications)
    .set({ code: input.code, name: input.name })
    .where(and(eq(letterClassifications.villageId, villageId), eq(letterClassifications.id, id)));
}

export async function deleteKlasifikasi(villageId: number, id: number): Promise<void> {
  await db
    .delete(letterClassifications)
    .where(and(eq(letterClassifications.villageId, villageId), eq(letterClassifications.id, id)));
}

/** Berapa jenis surat yang memakai klasifikasi ini (menghalangi penghapusan). */
export async function countJenisByKlasifikasi(villageId: number, classificationId: number) {
  const [row] = await db
    .select({ value: count() })
    .from(letterTypes)
    .where(
      and(eq(letterTypes.villageId, villageId), eq(letterTypes.classificationId, classificationId)),
    );

  return row?.value ?? 0;
}

// --- Jenis surat -----------------------------------------------------------

const jenisColumns = {
  id: letterTypes.id,
  code: letterTypes.code,
  name: letterTypes.name,
  classificationId: letterTypes.classificationId,
  classificationName: letterClassifications.name,
  templateBody: letterTypes.templateBody,
  requiresResident: letterTypes.requiresResident,
  isActive: letterTypes.isActive,
  numberFormat: letterTypes.numberFormat,
  validityMonths: letterTypes.validityMonths,
  sortOrder: letterTypes.sortOrder,
};

export async function listJenisSurat(villageId: number): Promise<JenisSuratDTO[]> {
  return db
    .select(jenisColumns)
    .from(letterTypes)
    .leftJoin(letterClassifications, eq(letterTypes.classificationId, letterClassifications.id))
    .where(eq(letterTypes.villageId, villageId))
    .orderBy(asc(letterTypes.sortOrder), asc(letterTypes.name));
}

export async function getJenisSurat(villageId: number, id: number): Promise<JenisSuratDTO | null> {
  const [row] = await db
    .select(jenisColumns)
    .from(letterTypes)
    .leftJoin(letterClassifications, eq(letterTypes.classificationId, letterClassifications.id))
    .where(and(eq(letterTypes.villageId, villageId), eq(letterTypes.id, id)))
    .limit(1);

  return row ?? null;
}

export async function jenisSuratExists(
  villageId: number,
  code: string,
  excludeId: number | null,
): Promise<boolean> {
  const filters = [eq(letterTypes.villageId, villageId), eq(letterTypes.code, code)];
  if (excludeId !== null) filters.push(ne(letterTypes.id, excludeId));

  const rows = await db
    .select({ id: letterTypes.id })
    .from(letterTypes)
    .where(and(...filters))
    .limit(1);

  return rows.length > 0;
}

export async function createJenisSurat(villageId: number, input: JenisSuratInput): Promise<number> {
  const [inserted] = await db
    .insert(letterTypes)
    .values({
      villageId,
      classificationId: input.classificationId,
      code: input.code,
      name: input.name,
      templateBody: input.templateBody,
      requiresResident: input.requiresResident,
      isActive: input.isActive,
      numberFormat: input.numberFormat,
      validityMonths: input.validityMonths,
      sortOrder: input.sortOrder,
    })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan jenis surat.");
  return inserted.id;
}

export async function updateJenisSurat(
  villageId: number,
  id: number,
  input: JenisSuratInput,
): Promise<void> {
  await db
    .update(letterTypes)
    .set({
      classificationId: input.classificationId,
      code: input.code,
      name: input.name,
      templateBody: input.templateBody,
      requiresResident: input.requiresResident,
      isActive: input.isActive,
      numberFormat: input.numberFormat,
      validityMonths: input.validityMonths,
      sortOrder: input.sortOrder,
    })
    .where(and(eq(letterTypes.villageId, villageId), eq(letterTypes.id, id)));
}

export async function deleteJenisSurat(villageId: number, id: number): Promise<void> {
  await db
    .delete(letterTypes)
    .where(and(eq(letterTypes.villageId, villageId), eq(letterTypes.id, id)));
}

/** Berapa surat yang sudah memakai jenis ini (menghalangi penghapusan). */
export async function countSuratByJenis(villageId: number, typeId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(letters)
    .where(and(eq(letters.villageId, villageId), eq(letters.typeId, typeId)));

  return row?.value ?? 0;
}
