import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { residents, rumahTangga } from "@/db/schema";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import {
  type DtksAnggotaRow,
  type DtksCreateInput,
  type DtksDetailDTO,
  type DtksUpdateInput,
  type ListDtksParams,
  type ListDtksResult,
} from "@/features/penduduk/domain/dtks";
import {
  buildDtksCsv,
  buildDtksRekapCsv,
  dtksFilename,
  dtksRekapFilename,
  hitungRekapDtks,
  type BarisImporDtks,
  type DtksRekap,
} from "@/features/penduduk/domain/dtks-berkas";
import {
  createOrGetDtks,
  deleteDtks,
  deleteLampiranDtks,
  deletePengaturanProgram,
  findRtmIdsByNumbers,
  getDtksDetail,
  insertLampiranDtks,
  lepasLampiran,
  listDtks,
  listDtksAnggota,
  listDtksEkspor,
  listLampiranDtks,
  listLampiranTerpasang,
  listPengaturanProgram,
  tautkanLampiran,
  updateDtks,
  upsertPengaturanProgram,
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

export async function updateDtksUseCase(
  villageId: number,
  id: number,
  input: DtksUpdateInput,
): Promise<void> {
  const detail = await getDtksDetail(villageId, id);
  if (!detail) throw new Error("Data DTKS tidak ditemukan.");
  await updateDtks(villageId, id, input);
}

// --- Ekspor, laporan, dan impor -------------------------------------------

/**
 * Impor DTKS dari berkas: menautkan nomor RTM ke formulir DTKS.
 *
 * Baris dengan nomor RTM yang tidak ada di desa ini dilaporkan (bukan gagal
 * total) supaya satu baris salah tidak menggagalkan seluruh impor. RTM yang
 * sudah punya DTKS pada versi kuisioner ini dilewati agar impor idempoten.
 */
export async function imporDtksUseCase(
  villageId: number,
  rows: readonly BarisImporDtks[],
): Promise<{ dibuat: number; dilewati: number; tidakDitemukan: string[] }> {
  const peta = await findRtmIdsByNumbers(
    villageId,
    rows.map((row) => row.noRtm),
  );

  let dibuat = 0;
  let dilewati = 0;
  const tidakDitemukan: string[] = [];

  for (const row of rows) {
    const rtmId = peta.get(row.noRtm);
    if (!rtmId) {
      tidakDitemukan.push(row.noRtm);
      continue;
    }

    const dtksId = await createOrGetDtks(villageId, rtmId);
    const detail = await getDtksDetail(villageId, dtksId);
    const sudahAdaMetadata =
      detail !== null && (detail.namaResponden !== null || detail.namaPetugasPencacahan !== null);

    if (sudahAdaMetadata) {
      dilewati += 1;
      continue;
    }

    await updateDtks(villageId, dtksId, {
      status: detail?.status ?? "draf",
      tanggalPencacahan: row.tanggalPencacahan,
      tanggalPemeriksaan: detail?.tanggalPemeriksaan ?? "",
      namaPetugasPencacahan: row.namaPetugas,
      namaResponden: row.namaResponden,
      keterangan: detail?.keterangan ?? "",
    });
    dibuat += 1;
  }

  return { dibuat, dilewati, tidakDitemukan };
}

/** Rekapitulasi DTKS mengikuti filter daftar. */
export interface DtksRekapData {
  rekap: DtksRekap;
  namaDesa: string | null;
}

export async function getRekapDtksUseCase(
  villageId: number,
  params: ListDtksParams,
): Promise<DtksRekapData> {
  const [rows, desa] = await Promise.all([listDtksEkspor(villageId, params), getIdentitas()]);
  return { rekap: hitungRekapDtks(rows), namaDesa: desa?.namaDesa ?? null };
}

/** Ekspor daftar DTKS sebagai CSV. */
export async function exportDtksUseCase(
  villageId: number,
  params: ListDtksParams,
): Promise<{ csv: string; filename: string }> {
  const [rows, desa] = await Promise.all([listDtksEkspor(villageId, params), getIdentitas()]);
  const namaDesa = desa?.namaDesa ?? null;

  return { csv: buildDtksCsv({ namaDesa, rows }), filename: dtksFilename(namaDesa) };
}

/** Ekspor rekapitulasi DTKS sebagai CSV. */
export async function exportRekapDtksUseCase(
  villageId: number,
  params: ListDtksParams,
): Promise<{ csv: string; filename: string }> {
  const { rekap, namaDesa } = await getRekapDtksUseCase(villageId, params);

  return {
    csv: buildDtksRekapCsv({ namaDesa, rekap }),
    filename: dtksRekapFilename(namaDesa),
  };
}

// --- Lampiran --------------------------------------------------------------

export async function listLampiranDtksUseCase(villageId: number) {
  return listLampiranDtks(villageId);
}

export async function listLampiranTerpasangUseCase(villageId: number, dtksId: number) {
  return listLampiranTerpasang(villageId, dtksId);
}

export async function unggahLampiranDtksUseCase(input: {
  villageId: number;
  nama: string;
  berkas: string;
  keterangan: string | null;
}): Promise<number> {
  return insertLampiranDtks(input);
}

export async function hapusLampiranDtksUseCase(villageId: number, id: number): Promise<void> {
  await deleteLampiranDtks(villageId, id);
}

export async function tautkanLampiranUseCase(
  villageId: number,
  dtksId: number,
  lampiranId: number,
): Promise<void> {
  const detail = await getDtksDetail(villageId, dtksId);
  if (!detail) throw new Error("Data DTKS tidak ditemukan.");
  await tautkanLampiran(villageId, dtksId, lampiranId);
}

export async function lepasLampiranUseCase(
  villageId: number,
  dtksId: number,
  lampiranId: number,
): Promise<void> {
  await lepasLampiran(villageId, dtksId, lampiranId);
}

// --- Pengaturan program -----------------------------------------------------

export async function listProgramDtksUseCase(villageId: number) {
  return listPengaturanProgram(villageId);
}

export async function simpanProgramDtksUseCase(input: {
  villageId: number;
  kodeProgram: string;
  namaProgram: string;
  aktif: boolean;
}): Promise<void> {
  await upsertPengaturanProgram(input);
}

export async function hapusProgramDtksUseCase(villageId: number, id: number): Promise<void> {
  await deletePengaturanProgram(villageId, id);
}
