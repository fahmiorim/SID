import "server-only";

import { getPendudukReference } from "@/features/penduduk/application/use-cases";

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
  const ref = await getPendudukReference();

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
