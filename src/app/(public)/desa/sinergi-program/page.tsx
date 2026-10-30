import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { daftarSinergiPublik } from "@/features/sinergi/application/sinergi-use-cases";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Sinergi Program · ${desa.namaDesa ?? "Desa"}`,
    description: `Program lintas pihak dan mitra pembangunan desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function SinergiPublikPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const rows = await daftarSinergiPublik(desa.id);
  const Sinergi = tema.sinergi;

  return <Sinergi ctx={ctx} program={rows} />;
}
