import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { residents, rumahTangga } from "@/db/schema";
import {
  type DtksAnggotaRow,
  type DtksCreateInput,
  type DtksDetailDTO,
  type ListDtksParams,
  type ListDtksResult,
} from "@/features/penduduk/domain/dtks";
import {
  createOrGetDtks,
  deleteDtks,
  getDtksDetail,
  listDtks,
  listDtksAnggota,
} from "@/features/penduduk/infrastructure/dtks-repository";

export async function getDtksListUseCase(
  villageId: number,
  params: ListDtksParams,
): Promise<ListDtksResult> {
  return listDtks(villageId, params);
}

export async function getDtksDetailUseCase(
  villageId: number,
  id: number,
): Promise<{ dtks: DtksDetailDTO; anggota: DtksAnggotaRow[] } | null> {
  const [detail, anggota] = await Promise.all([
    getDtksDetail(villageId, id),
    listDtksAnggota(villageId, id),
  ]);

  if (!detail) return null;

  return { dtks: detail, anggota };
}

export async function createDtksUseCase(
  villageId: number,
  input: DtksCreateInput,
): Promise<number> {
  // Validasi RTM milik village
  const rtmRow = await db
    .select({ id: rumahTangga.id })
    .from(rumahTangga)
    .where(and(eq(rumahTangga.id, input.rtmId), eq(rumahTangga.villageId, villageId)))
    .limit(1);

  if (!rtmRow[0]) {
    throw new Error("Rumah Tangga tidak ditemukan.");
  }

  return createOrGetDtks(villageId, input.rtmId, input.versiKuisioner);
}

export async function deleteDtksUseCase(villageId: number, id: number): Promise<void> {
  await deleteDtks(villageId, id);
}

/** Ambil daftar RTM yang belum terdaftar di DTKS untuk dialog "Data Baru". */
export async function getAvailableRtmForDtks(villageId: number) {
  // Ambil semua RTM beserta Kepala RTM-nya
  const allRtm = await db
    .select({
      id: rumahTangga.id,
      number: rumahTangga.number,
      kepalaName: residents.name,
      kepalaNik: residents.nationalId,
    })
    .from(rumahTangga)
    .leftJoin(residents, and(eq(residents.rtmId, rumahTangga.id), eq(residents.rtmLevel, 1)))
    .where(eq(rumahTangga.villageId, villageId));

  return allRtm;
}
