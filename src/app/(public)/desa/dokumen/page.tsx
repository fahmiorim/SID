import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { listDokumenPublik } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Informasi Publik" };

/** Informasi publik & produk hukum (dari tabel `dokumen_publik`). */
export default async function DokumenPublikPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const dokumen = await listDokumenPublik(desa.id);

  const Dokumen = tema.dokumen;

  return <Dokumen ctx={ctx} dokumen={dokumen} />;
}
