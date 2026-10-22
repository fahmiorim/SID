import type { Metadata } from "next";

import { getStatistikDesa } from "@/features/desa/application/statistik-desa";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Statistik Desa" };

export default async function StatistikDesaPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const statistik = await getStatistikDesa(desa.id);

  const Statistik = tema.statistik;

  return <Statistik ctx={ctx} statistik={statistik} />;
}
