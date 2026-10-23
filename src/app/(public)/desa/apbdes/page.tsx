import type { Metadata } from "next";

import { getLaporanApbdesPublik } from "@/features/keuangan/application/laporan-publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  const laporan = await getLaporanApbdesPublik(desa.id);

  return {
    title: `APBDes ${laporan.tahun} · ${desa.namaDesa ?? "Desa"}`,
    description: `Laporan Anggaran Pendapatan dan Belanja Desa ${desa.namaDesa ?? "desa"} tahun ${laporan.tahun}.`,
  };
}

export default async function APBDesPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const laporan = await getLaporanApbdesPublik(desa.id);
  const Apbdes = tema.apbdes;

  return <Apbdes ctx={ctx} laporan={laporan} />;
}
