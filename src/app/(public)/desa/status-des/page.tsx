import type { Metadata } from "next";

import { getInventarisPublik } from "@/features/inventaris/application/inventaris-publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Status Desa · ${desa.namaDesa ?? "Desa"}`,
    description: `Identitas dan ringkasan aset desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function StatusDesaPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const { rekap } = await getInventarisPublik(desa.id);
  const StatusDesa = tema.statusDesa;

  return <StatusDesa ctx={ctx} desa={desa} inventaris={rekap} />;
}
