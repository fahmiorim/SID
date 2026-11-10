import type { Metadata } from "next";

import { getPetaPublik } from "@/features/gis/application/use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  const nama = desa.namaDesa ?? "Desa";

  return {
    title: `Peta ${nama}`,
    description: `Peta interaktif desa ${nama}`,
  };
}

export default async function PetaPage() {
  const { ctx, tema } = await siapkanTema();
  const peta = await getPetaPublik();

  const Peta = tema.peta;

  return <Peta ctx={ctx} peta={peta} />;
}
