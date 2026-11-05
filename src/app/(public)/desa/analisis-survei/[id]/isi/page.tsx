import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { listSurveiPublik } from "@/features/publik/infrastructure/survey-repository";
import { IsiSurveiForm } from "@/features/survey/presentation/components/isi-survei-form";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Isi Survei · ${desa.namaDesa ?? "Desa"}`,
    description: `Isi survei aktif yang sedang dihimpun oleh ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function IsiSurveiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const surveyId = parseInt(id, 10);
  if (isNaN(surveyId)) notFound();

  const { desa } = await siapkanTema();
  const surveiList = await listSurveiPublik(desa.id);
  const survei = surveiList.find((item) => item.id === surveyId);

  if (!survei) notFound();

  return (
    <div className="space-y-8">
      <ThemePageHeader
        title={survei.judul}
        description={survei.deskripsi ?? "Silakan isi survei ini dengan jujur."}
      />
      <ThemeCard className="p-5">
        <IsiSurveiForm survei={survei} />
      </ThemeCard>
    </div>
  );
}
