import "server-only";

import { and, asc, count, eq, like, ne, or, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";

import { db } from "@/db";
import {
  bloodTypes,
  citizenships,
  educations,
  families,
  familyRelations,
  maritalStatuses,
  occupations,
  regions,
  religions,
  residents,
} from "@/db/schema";
import {
  HEAD_OF_FAMILY_RELATION_ID,
  type LifeStatus,
  type PendudukDTO,
  type PendudukFormInput,
  type PendudukListRow,
} from "@/features/penduduk/domain/penduduk";
import { formatWilayahLabel } from "@/features/wilayah/domain/wilayah";

export interface ListPendudukParams {
  villageId: number;
  search: string;
  lifeStatus: LifeStatus | null;
  page: number;
  pageSize: number;
}

export interface PendudukListResult {
  rows: PendudukListRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Ubah teks kosong menjadi `NULL` agar basis data tidak menyimpan string kosong. */
function blankToNull(value: string): string | null {
  return value === "" ? null : value;
}

/** Petakan baris `residents` → DTO domain (kosakata Indonesia). */
function toDto(row: typeof residents.$inferSelect): PendudukDTO {
  return {
    id: row.id,
    nationalId: row.nationalId,
    familyId: row.familyId,
    name: row.name,
    gender: row.gender,
    birthPlace: row.birthPlace,
    birthDate: row.birthDate,
    religionId: row.religionId,
    educationId: row.educationId,
    educationSedangId: row.educationSedangId,
    occupationId: row.occupationId,
    maritalStatusId: row.maritalStatusId,
    familyRelationId: row.familyRelationId,
    bloodTypeId: row.bloodTypeId,
    citizenshipId: row.citizenshipId,
    residenceStatus: row.residenceStatus,
    lifeStatus: row.lifeStatus,
    regionId: row.regionId,
    address: row.address,
    phone: row.phone,
    fatherName: row.fatherName,
    motherName: row.motherName,
    fatherNationalId: row.fatherNationalId,
    motherNationalId: row.motherNationalId,
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

function buildWhere(villageId: number, search: string, lifeStatus: LifeStatus | null): SQL {
  const villageFilter = eq(residents.villageId, villageId);
  const filters: SQL[] = [villageFilter];

  if (search) {
    const term = `%${search}%`;
    const searchFilter = or(
      like(residents.name, term),
      like(residents.nationalId, term),
      like(families.number, term),
    );
    if (searchFilter) filters.push(searchFilter);
  }

  if (lifeStatus) {
    filters.push(eq(residents.lifeStatus, lifeStatus));
  }

  return and(...filters) ?? villageFilter;
}

export async function listPenduduk(params: ListPendudukParams): Promise<PendudukListResult> {
  const { villageId, search, lifeStatus, page, pageSize } = params;
  const where = buildWhere(villageId, search, lifeStatus);

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        resident: residents,
        religionName: religions.name,
        familyNumber: families.number,
        dusun: regions.dusun,
        rw: regions.rw,
        rt: regions.rt,
      })
      .from(residents)
      .leftJoin(religions, eq(residents.religionId, religions.id))
      .leftJoin(families, eq(residents.familyId, families.id))
      .leftJoin(regions, eq(residents.regionId, regions.id))
      .where(where)
      .orderBy(asc(residents.name), asc(residents.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(residents)
      .leftJoin(families, eq(residents.familyId, families.id))
      .where(where),
  ]);

  const total = totalRows[0]?.value ?? 0;

  return {
    rows: rows.map((row) => ({
      ...toDto(row.resident),
      religionName: row.religionName ?? null,
      familyNumber: row.familyNumber ?? null,
      regionLabel: formatRegionLabel(row.resident.regionId, row.dusun, row.rw, row.rt),
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findPendudukById(villageId: number, id: number): Promise<PendudukDTO | null> {
  const [row] = await db
    .select()
    .from(residents)
    .where(and(eq(residents.villageId, villageId), eq(residents.id, id)))
    .limit(1);

  return row ? toDto(row) : null;
}

/** Apakah NIK sudah dipakai penduduk lain di desa yang sama. */
export async function nationalIdExists(
  villageId: number,
  nationalId: string,
  excludeId: number | null,
): Promise<boolean> {
  const filters: SQL[] = [eq(residents.villageId, villageId), eq(residents.nationalId, nationalId)];

  if (excludeId !== null) {
    filters.push(ne(residents.id, excludeId));
  }

  const duplicates = await db
    .select({ id: residents.id })
    .from(residents)
    .where(and(...filters))
    .limit(1);

  return duplicates.length > 0;
}

/** Apakah KK sudah punya kepala keluarga lain (selain `excludeId`). */
export async function headOfFamilyExists(
  villageId: number,
  familyId: number,
  excludeId: number | null,
): Promise<boolean> {
  const filters: SQL[] = [
    eq(residents.villageId, villageId),
    eq(residents.familyId, familyId),
    eq(residents.familyRelationId, HEAD_OF_FAMILY_RELATION_ID),
  ];

  if (excludeId !== null) {
    filters.push(ne(residents.id, excludeId));
  }

  const rows = await db
    .select({ id: residents.id })
    .from(residents)
    .where(and(...filters))
    .limit(1);

  return rows.length > 0;
}

/** Pilihan penduduk untuk formulir fitur lain (mis. surat). */
export interface PendudukOption {
  id: number;
  name: string;
  nationalId: string | null;
}

export async function listPendudukOptions(villageId: number): Promise<PendudukOption[]> {
  return db
    .select({ id: residents.id, name: residents.name, nationalId: residents.nationalId })
    .from(residents)
    .where(eq(residents.villageId, villageId))
    .orderBy(asc(residents.name), asc(residents.id));
}

/** Data penduduk yang dibutuhkan untuk mengisi placeholder surat. */
export interface PendudukSuratData extends PendudukDTO {
  religionName: string | null;
  occupationName: string | null;
  familyNumber: string | null;
}

export async function getPendudukSuratData(
  villageId: number,
  id: number,
): Promise<PendudukSuratData | null> {
  const [row] = await db
    .select({
      resident: residents,
      religionName: religions.name,
      occupationName: occupations.name,
      familyNumber: families.number,
    })
    .from(residents)
    .leftJoin(religions, eq(residents.religionId, religions.id))
    .leftJoin(occupations, eq(residents.occupationId, occupations.id))
    .leftJoin(families, eq(residents.familyId, families.id))
    .where(and(eq(residents.villageId, villageId), eq(residents.id, id)))
    .limit(1);

  if (!row) return null;

  return {
    ...toDto(row.resident),
    religionName: row.religionName ?? null,
    occupationName: row.occupationName ?? null,
    familyNumber: row.familyNumber ?? null,
  };
}

/** Satu anggota keluarga untuk pengisian placeholder surat `klg1_*` … `klg10_*`. */
export interface AnggotaKeluargaSuratRow {
  id: number;
  nationalId: string | null;
  name: string;
  gender: PendudukDTO["gender"];
  birthPlace: string | null;
  birthDate: string | null;
  religionName: string | null;
  educationName: string | null;
  educationSedangName: string | null;
  occupationName: string | null;
  maritalStatusName: string | null;
  familyRelationName: string | null;
  citizenshipName: string | null;
  bloodTypeName: string | null;
  address: string | null;
  fatherName: string | null;
  motherName: string | null;
  fatherNationalId: string | null;
  motherNationalId: string | null;
}

/**
 * Anggota keluarga yang masih hidup, urut dari kepala keluarga.
 *
 * Dipakai untuk mengisi placeholder `[klg1_nama]`, `[klg2_nik]`, dst. pada
 * template surat. Batas 10 mengikuti parity OpenSID.
 */
export async function listAnggotaKeluargaSurat(
  villageId: number,
  familyId: number,
): Promise<AnggotaKeluargaSuratRow[]> {
  const educationsSedang = alias(educations, "educations_sedang");

  return db
    .select({
      id: residents.id,
      nationalId: residents.nationalId,
      name: residents.name,
      gender: residents.gender,
      birthPlace: residents.birthPlace,
      birthDate: residents.birthDate,
      religionName: religions.name,
      educationName: educations.name,
      educationSedangName: educationsSedang.name,
      occupationName: occupations.name,
      maritalStatusName: maritalStatuses.name,
      familyRelationName: familyRelations.name,
      citizenshipName: citizenships.name,
      bloodTypeName: bloodTypes.name,
      address: residents.address,
      fatherName: residents.fatherName,
      motherName: residents.motherName,
      fatherNationalId: residents.fatherNationalId,
      motherNationalId: residents.motherNationalId,
    })
    .from(residents)
    .leftJoin(religions, eq(residents.religionId, religions.id))
    .leftJoin(educations, eq(residents.educationId, educations.id))
    .leftJoin(educationsSedang, eq(residents.educationSedangId, educationsSedang.id))
    .leftJoin(occupations, eq(residents.occupationId, occupations.id))
    .leftJoin(maritalStatuses, eq(residents.maritalStatusId, maritalStatuses.id))
    .leftJoin(familyRelations, eq(residents.familyRelationId, familyRelations.id))
    .leftJoin(citizenships, eq(residents.citizenshipId, citizenships.id))
    .leftJoin(bloodTypes, eq(residents.bloodTypeId, bloodTypes.id))
    .where(
      and(
        eq(residents.villageId, villageId),
        eq(residents.familyId, familyId),
        eq(residents.lifeStatus, "alive"),
      ),
    )
    .orderBy(asc(residents.familyRelationId), asc(residents.id))
    .limit(10);
}

/**
 * Data penduduk untuk placeholder pengikut surat (`pengikut1_*` … `pengikut10_*`).
 *
 * Boleh dipakai ≤10 id per panggilan (mengikuti batas pengikut surat); id yang
 * tidak ditemukan / bukan warga desa ini diabaikan.
 */
export async function listPendudukSuratByIds(
  villageId: number,
  ids: readonly number[],
): Promise<AnggotaKeluargaSuratRow[]> {
  if (ids.length === 0) return [];

  const educationsSedang = alias(educations, "educations_sedang");
  const rows: AnggotaKeluargaSuratRow[] = [];
  for (const id of ids.slice(0, 10)) {
    const [row] = await db
      .select({
        id: residents.id,
        nationalId: residents.nationalId,
        name: residents.name,
        gender: residents.gender,
        birthPlace: residents.birthPlace,
        birthDate: residents.birthDate,
        religionName: religions.name,
        educationName: educations.name,
        educationSedangName: educationsSedang.name,
        occupationName: occupations.name,
        maritalStatusName: maritalStatuses.name,
        familyRelationName: familyRelations.name,
        citizenshipName: citizenships.name,
        bloodTypeName: bloodTypes.name,
        address: residents.address,
        fatherName: residents.fatherName,
        motherName: residents.motherName,
        fatherNationalId: residents.fatherNationalId,
        motherNationalId: residents.motherNationalId,
      })
      .from(residents)
      .leftJoin(religions, eq(residents.religionId, religions.id))
      .leftJoin(educations, eq(residents.educationId, educations.id))
      .leftJoin(educationsSedang, eq(residents.educationSedangId, educationsSedang.id))
      .leftJoin(occupations, eq(residents.occupationId, occupations.id))
      .leftJoin(maritalStatuses, eq(residents.maritalStatusId, maritalStatuses.id))
      .leftJoin(familyRelations, eq(residents.familyRelationId, familyRelations.id))
      .leftJoin(citizenships, eq(residents.citizenshipId, citizenships.id))
      .leftJoin(bloodTypes, eq(residents.bloodTypeId, bloodTypes.id))
      .where(and(eq(residents.villageId, villageId), eq(residents.id, id)))
      .limit(1);

    if (row) rows.push(row);
  }

  return rows;
}

export async function insertPenduduk(villageId: number, input: PendudukFormInput): Promise<number> {
  const [inserted] = await db
    .insert(residents)
    .values({
      villageId,
      nationalId: input.nationalId,
      familyId: input.familyId,
      name: input.name,
      gender: input.gender,
      birthPlace: blankToNull(input.birthPlace),
      birthDate: input.birthDate,
      religionId: input.religionId,
      educationId: input.educationId,
      educationSedangId: input.educationSedangId,
      occupationId: input.occupationId,
      maritalStatusId: input.maritalStatusId,
      familyRelationId: input.familyRelationId,
      bloodTypeId: input.bloodTypeId,
      citizenshipId: input.citizenshipId,
      residenceStatus: input.residenceStatus,
      lifeStatus: input.lifeStatus,
      regionId: input.regionId,
      address: blankToNull(input.address),
      phone: blankToNull(input.phone),
      fatherName: blankToNull(input.fatherName),
      motherName: blankToNull(input.motherName),
      fatherNationalId: input.fatherNationalId,
      motherNationalId: input.motherNationalId,
    })
    .$returningId();

  if (!inserted) throw new Error("Gagal menyimpan data penduduk.");
  return inserted.id;
}

export async function updatePenduduk(id: number, input: PendudukFormInput): Promise<void> {
  await db
    .update(residents)
    .set({
      nationalId: input.nationalId,
      familyId: input.familyId,
      name: input.name,
      gender: input.gender,
      birthPlace: blankToNull(input.birthPlace),
      birthDate: input.birthDate,
      religionId: input.religionId,
      educationId: input.educationId,
      educationSedangId: input.educationSedangId,
      occupationId: input.occupationId,
      maritalStatusId: input.maritalStatusId,
      familyRelationId: input.familyRelationId,
      bloodTypeId: input.bloodTypeId,
      citizenshipId: input.citizenshipId,
      residenceStatus: input.residenceStatus,
      lifeStatus: input.lifeStatus,
      regionId: input.regionId,
      address: blankToNull(input.address),
      phone: blankToNull(input.phone),
      fatherName: blankToNull(input.fatherName),
      motherName: blankToNull(input.motherName),
      fatherNationalId: input.fatherNationalId,
      motherNationalId: input.motherNationalId,
    })
    .where(eq(residents.id, id));
}

export async function deletePenduduk(id: number): Promise<void> {
  await db.delete(residents).where(eq(residents.id, id));
}
