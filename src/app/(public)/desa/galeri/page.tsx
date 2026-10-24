import type { Metadata } from "next";

import { daftarAlbumGaleri } from "@/features/publik/application/konten-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

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
  const album = await daftarAlbumGaleri(desa.id);

  const Galeri = tema.galeri;

  return <Galeri ctx={ctx} album={album} />;
}
