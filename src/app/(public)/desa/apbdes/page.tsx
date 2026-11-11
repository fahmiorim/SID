import type { Metadata } from "next";

import { listLaporanDokumenApbdesPublik } from "@/features/keuangan/application/laporan-dokumen-publik-use-cases";
import { getLaporanApbdesPublik } from "@/features/keuangan/application/laporan-publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: PageProps<"/desa/apbdes">): Promise<Metadata> {
  const { desa } = await siapkanTema();
  const params = await searchParams;
  const tahun = typeof params.tahun === "string" ? Number(params.tahun) : undefined;
  const laporan = await getLaporanApbdesPublik(desa.id, tahun);

  return {
    title: `APBDes ${laporan.tahun} · ${desa.namaDesa ?? "Desa"}`,
    description: `Laporan Anggaran Pendapatan dan Belanja Desa ${desa.namaDesa ?? "desa"} tahun ${laporan.tahun}.`,
  };
}

export default async function APBDesPage({ searchParams }: PageProps<"/desa/apbdes">) {
  const { ctx, tema, desa } = await siapkanTema();
  const params = await searchParams;
  const tahun = typeof params.tahun === "string" ? Number(params.tahun) : undefined;
  const [laporan, dokumen] = await Promise.all([
    getLaporanApbdesPublik(desa.id, tahun),
    listLaporanDokumenApbdesPublik(desa.id),
  ]);
  const Apbdes = tema.apbdes;

  return <Apbdes ctx={ctx} laporan={laporan} dokumen={dokumen} />;
}
