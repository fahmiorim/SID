import "server-only";

import { and, eq } from "drizzle-orm";

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
  type LifeStatus,
  type PendudukDTO,
  type PendudukListRow,
} from "@/features/penduduk/domain/penduduk";

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
}
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

export async function getPendudukById(villageId: number, id: number): Promise<PendudukDTO | null> {
  const row = await db.query.residents.findFirst({
    where: and(eq(residents.id, id), eq(residents.villageId, villageId)),
  });
  return row ? toDto(row) : null;
}

export async function getPendudukDetailById(villageId: number, id: number) {
  const row = await db
    .select({
      resident: residents,
      family: families,
      region: regions,
      religion: religions,
      education: educations,
      occupation: occupations,
      maritalStatus: maritalStatuses,
      familyRelation: familyRelations,
      bloodType: bloodTypes,
      citizenship: citizenships,
    })
    .from(residents)
    .leftJoin(families, eq(residents.familyId, families.id))
    .leftJoin(regions, eq(residents.regionId, regions.id))
    .leftJoin(religions, eq(residents.religionId, religions.id))
    .leftJoin(educations, eq(residents.educationId, educations.id))
    .leftJoin(occupations, eq(residents.occupationId, occupations.id))
    .leftJoin(maritalStatuses, eq(residents.maritalStatusId, maritalStatuses.id))
    .leftJoin(familyRelations, eq(residents.familyRelationId, familyRelations.id))
    .leftJoin(bloodTypes, eq(residents.bloodTypeId, bloodTypes.id))
    .leftJoin(citizenships, eq(residents.citizenshipId, citizenships.id))
    .where(and(eq(residents.id, id), eq(residents.villageId, villageId)))
    .limit(1);

  if (row.length === 0) return null;
  return row[0];
}
