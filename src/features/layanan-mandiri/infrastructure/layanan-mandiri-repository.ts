import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { letterTypes, permohonanSurat, residents } from "@/db/schema";
import {
  PERMOHONAN_STATUS,
  type PermohonanStatus,
} from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { conflict } from "@/lib/errors";

export async function listSuratMandiri(villageId: number) {
  return db
    .select()
    .from(letterTypes)
    .where(and(eq(letterTypes.villageId, villageId), eq(letterTypes.isActive, true)))
    .orderBy(asc(letterTypes.sortOrder));
}

export async function listPermohonan(villageId: number) {
  return db
    .select({
      id: permohonanSurat.id,
      idPemohon: permohonanSurat.residentId,
      idSurat: permohonanSurat.letterTypeId,
      status: permohonanSurat.status,
      alasan: permohonanSurat.alasan,
      keterangan: permohonanSurat.keterangan,
      noAntrian: permohonanSurat.noAntrian,
      createdAt: permohonanSurat.createdAt,
      namaSurat: letterTypes.name,
      namaPemohon: residents.name,
    })
    .from(permohonanSurat)
    .leftJoin(letterTypes, eq(permohonanSurat.letterTypeId, letterTypes.id))
    .leftJoin(residents, eq(permohonanSurat.residentId, residents.id))
    .where(eq(permohonanSurat.villageId, villageId))
    .orderBy(desc(permohonanSurat.createdAt));
}

export async function buatPermohonan(data: {
  villageId: number;
  residentId: number;
  letterTypeId: number;
  isianForm?: string;
  noHpAktif?: string;
  keterangan?: string;
  syarat?: string;
}) {
  const [row] = await db
    .insert(permohonanSurat)
    .values({
      villageId: data.villageId,
      residentId: data.residentId,
      letterTypeId: data.letterTypeId,
      isianForm: data.isianForm || null,
      noHpAktif: data.noHpAktif || null,
      keterangan: data.keterangan || null,
      syarat: data.syarat || null,
      status: 1,
      noAntrian: `AN-${Date.now()}`,
    })
    .$returningId();
  return row?.id;
}

function validStatus(status: number): PermohonanStatus {
  const value = String(status);
  if (!(PERMOHONAN_STATUS as readonly string[]).includes(value)) {
    throw conflict("Status permohonan tidak valid.");
  }
  return value as PermohonanStatus;
}

export async function prosesPermohonan(
  villageId: number,
  id: number,
  status: number,
  alasan?: string,
) {
  const nextStatus = Number(validStatus(status));

  const [result] = await db
    .update(permohonanSurat)
    .set({ status: nextStatus, alasan: alasan || null })
    .where(and(eq(permohonanSurat.villageId, villageId), eq(permohonanSurat.id, id)));

  if (result.affectedRows === 0) throw conflict("Permohonan tidak ditemukan.");
}

export async function kembalikanPermohonan(villageId: number, id: number, alasan: string) {
  const [result] = await db
    .update(permohonanSurat)
    .set({ status: 0, alasan })
    .where(and(eq(permohonanSurat.villageId, villageId), eq(permohonanSurat.id, id)));

  if (result.affectedRows === 0) throw conflict("Permohonan tidak ditemukan.");
}
