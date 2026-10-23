import type { Metadata } from "next";

import { getStatistikPublik } from "@/features/desa/application/statistik-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Statistik Desa · ${desa.namaDesa ?? "Desa"}`,
    description: `Data kependudukan, bantuan, dan keuangan ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function StatistikPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const statistik = await getStatistikPublik(desa.id);
  const Statistik = tema.statistik;

  return <Statistik ctx={ctx} statistik={statistik} />;
}
