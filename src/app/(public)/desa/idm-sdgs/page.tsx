import type { Metadata } from "next";

import { getLaporanTriwulanPublik } from "@/features/keuangan/application/laporan-publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Laporan Triwulan & IDM/SDGs · ${desa.namaDesa ?? "Desa"}`,
    description: `Realisasi anggaran per triwulan dan status IDM/SDGs ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function IDMSDGsPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const params = await searchParams;
  const tahunParam = typeof params.tahun === "string" ? Number(params.tahun) : undefined;

  const { ctx, tema, desa } = await siapkanTema();
  const laporan = await getLaporanTriwulanPublik(
    desa.id,
    Number.isInteger(tahunParam) ? tahunParam : undefined,
  );
  const Triwulan = tema.triwulan;

  return (
    <Triwulan
      ctx={ctx}
      tahun={laporan.tahun}
      tersedia={laporan.tersedia}
      baris={laporan.baris}
      total={laporan.total}
    />
  );
}
