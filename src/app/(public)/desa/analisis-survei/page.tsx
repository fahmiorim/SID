import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import {
  listPeriodeSurveiPublik,
  listSurveiPublik,
} from "@/features/publik/application/survei-publik";
import { parsePeriodeTahun } from "@/features/publik/domain/rekap-survei";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Analisis & Survei · ${desa.namaDesa ?? "Desa"}`,
    description: `Survei dan hasil pendataan yang dihimpun desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function AnalisisSurveiPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const params = await searchParams;
  const periode = parsePeriodeTahun(params.periode);

  const { ctx, tema, desa } = await siapkanTema();
  const [survei, tersedia] = await Promise.all([
    listSurveiPublik(desa.id, periode),
    listPeriodeSurveiPublik(desa.id),
  ]);
  const Survei = tema.survei;

  return <Survei ctx={ctx} survei={survei} periode={periode} tersedia={tersedia} />;
}
