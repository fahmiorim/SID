import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { listAlbumGaleri } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Galeri Desa · ${desa.namaDesa ?? "Desa"}`,
    description: `Dokumentasi kegiatan dan potret ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function GaleriPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const album = await listAlbumGaleri(desa.id);

  const Galeri = tema.galeri;

  return <Galeri ctx={ctx} album={album} />;
}
