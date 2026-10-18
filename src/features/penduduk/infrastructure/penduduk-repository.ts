import "server-only";

import { and, asc, count, eq, like, ne, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { families, regions, religions, residents } from "@/db/schema";
import type {
  LifeStatus,
  PendudukDTO,
  PendudukFormInput,
  PendudukListRow,
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
    })
    .where(eq(residents.id, id));
}

export async function deletePenduduk(id: number): Promise<void> {
  await db.delete(residents).where(eq(residents.id, id));
}
