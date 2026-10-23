import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { listJenisSuratPublik } from "@/features/surat/application/surat-publik-use-cases";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Surat Desa · ${desa.namaDesa ?? "Desa"}`,
    description: `Jenis surat dan layanan administrasi ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function SuratPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const jenis = await listJenisSuratPublik(desa.id);
  const Surat = tema.surat;

  return <Surat ctx={ctx} jenis={jenis} />;
}
