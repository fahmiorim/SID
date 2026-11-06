import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import {
  getHasilSurveiPublik,
  listSurveiPublik,
} from "@/features/publik/application/survei-publik";

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
}: PageProps<"/desa/analisis-survei">) {
  const params = await searchParams;
  const rawTahun = typeof params.tahun === "string" ? Number(params.tahun) : Number.NaN;
  const tahun =
    Number.isInteger(rawTahun) && rawTahun >= 1900 && rawTahun <= 2100 ? rawTahun : null;

  const { ctx, tema, desa } = await siapkanTema();
  const [survei, hasil] = await Promise.all([
    listSurveiPublik(desa.id),
    getHasilSurveiPublik(desa.id, { tahun: tahun ?? undefined }),
  ]);
  const Survei = tema.survei;

  return (
    <Survei
      ctx={ctx}
      survei={survei}
      hasil={hasil.survei}
      tahun={tahun}
      tahunTersedia={hasil.tahunTersedia}
    />
  );
}
