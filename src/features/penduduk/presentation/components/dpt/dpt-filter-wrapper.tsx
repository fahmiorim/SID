import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import { getPendudukReferenceData } from "@/features/penduduk/infrastructure/reference-repository";
import { requirePermission } from "@/lib/dal";

import { DptFilterClient } from "./dpt-filter-client";

interface DptFilterWrapperProps {
  activeElection: { judul: string; tanggal: string } | null;
  defaultParams: {
    search: string;
    dusun: string;
    rw: string;
    rt: string;
    gender: string;
    agamaId?: number;
    pendidikanId?: number;
    pekerjaanId?: number;
    statusKawinId?: number;
    umurMin?: number;
    umurMax?: number;
  };
}

export async function DptFilterWrapper({ activeElection, defaultParams }: DptFilterWrapperProps) {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  const ref = await getPendudukReferenceData(villageId);

  return (
    <DptFilterClient
      activeElection={activeElection}
      defaultParams={defaultParams}
      agamaOptions={ref.religions}
      pendidikanOptions={ref.educations}
      pekerjaanOptions={ref.occupations}
      statusKawinOptions={ref.maritalStatuses}
      wilayahOptions={ref.regions}
    />
  );
}
