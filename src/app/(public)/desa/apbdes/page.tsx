import type { Metadata } from "next";

import { getLaporanApbdesPublik } from "@/features/keuangan/application/laporan-publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Transparansi APBDes" };

export default async function ApbdesPublikPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const laporan = await getLaporanApbdesPublik(desa.id);

  const Apbdes = tema.apbdes;

  return (
    <Apbdes
      ctx={ctx}
      laporan={{
        tahun: laporan.tahun,
        baris: laporan.baris,
        total: laporan.total,
        bidang: laporan.bidang,
      }}
    />
  );
}
