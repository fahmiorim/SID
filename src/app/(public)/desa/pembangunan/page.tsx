import type { Metadata } from "next";

import { getPembangunanPublik } from "@/features/pembangunan/application/use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembangunan Desa",
  description: "Rencana, realisasi, dan hasil proyek pembangunan desa.",
};

export default async function PembangunanPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const params = await searchParams;
  const tahunParam = Number(params.tahun ?? "");
  const tahun = Number.isInteger(tahunParam) && tahunParam > 0 ? tahunParam : null;

  const { ctx, tema } = await siapkanTema();
  const data = await getPembangunanPublik(tahun);

  const Pembangunan = tema.pembangunan;

  return <Pembangunan ctx={ctx} tahun={tahun} data={data} />;
}
