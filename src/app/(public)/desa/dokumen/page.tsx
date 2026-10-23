import type { Metadata } from "next";

import { daftarDokumenPublik } from "@/features/publik/application/dokumen-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Informasi Publik · ${desa.namaDesa ?? "Desa"}`,
    description: `Dokumen resmi dan informasi publik ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function DokumenPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const dokumen = await daftarDokumenPublik(desa.id);
  const Dokumen = tema.dokumen;

  return <Dokumen ctx={ctx} dokumen={dokumen} />;
}
