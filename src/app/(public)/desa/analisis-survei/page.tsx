import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { listSurveiPublik } from "@/features/publik/application/survei-publik";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Analisis & Survei · ${desa.namaDesa ?? "Desa"}`,
    description: `Survei aktif dan pertanyaan yang dihimpun desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function AnalisisSurveiPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const survei = await listSurveiPublik(desa.id);
  const Survei = tema.survei;

  return <Survei ctx={ctx} survei={survei} />;
}
