import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  bloodTypes,
  citizenships,
  educations,
  familyRelations,
  maritalStatuses,
  occupations,
  regions,
  religions,
} from "@/db/schema";
import type { PendudukReferenceData } from "@/features/penduduk/domain/penduduk";
import { formatWilayahLabel } from "@/features/wilayah/domain/wilayah";

/**
 * Data referensi untuk formulir penduduk.
 *
 * Katalog (agama, pendidikan, pekerjaan, dst.) bersifat global; hanya wilayah
 * yang dibatasi per desa. Semuanya dikembalikan dalam satu panggilan agar
 * halaman cukup sekali query.
 */
export async function getPendudukReferenceData(villageId: number): Promise<PendudukReferenceData> {
  const [
    religionRows,
    educationRows,
    occupationRows,
    maritalRows,
    relationRows,
    bloodRows,
    citizenshipRows,
    regionRows,
  ] = await Promise.all([
    db
      .select({ id: religions.id, name: religions.name })
      .from(religions)
      .orderBy(asc(religions.id)),
    db
      .select({ id: educations.id, name: educations.name })
      .from(educations)
      .orderBy(asc(educations.id)),
    db
      .select({ id: occupations.id, name: occupations.name })
      .from(occupations)
      .orderBy(asc(occupations.id)),
    db
      .select({ id: maritalStatuses.id, name: maritalStatuses.name })
      .from(maritalStatuses)
      .orderBy(asc(maritalStatuses.id)),
    db
      .select({ id: familyRelations.id, name: familyRelations.name })
      .from(familyRelations)
      .orderBy(asc(familyRelations.id)),
    db
      .select({ id: bloodTypes.id, name: bloodTypes.name })
      .from(bloodTypes)
      .orderBy(asc(bloodTypes.id)),
    db
      .select({ id: citizenships.id, name: citizenships.name })
      .from(citizenships)
      .orderBy(asc(citizenships.id)),
    db
      .select({
        id: regions.id,
        dusun: regions.dusun,
        rw: regions.rw,
        rt: regions.rt,
      })
      .from(regions)
      .where(eq(regions.villageId, villageId))
      .orderBy(asc(regions.sortOrder), asc(regions.dusun), asc(regions.rw), asc(regions.rt)),
  ]);

  return {
    religions: religionRows,
    educations: educationRows,
    occupations: occupationRows,
    maritalStatuses: maritalRows,
    familyRelations: relationRows,
    bloodTypes: bloodRows,
    citizenships: citizenshipRows,
    regions: regionRows.map((row) => ({
      id: row.id,
      label: formatWilayahLabel({ dusun: row.dusun ?? "", rw: row.rw ?? "", rt: row.rt ?? "" }),
    })),
  };
}
