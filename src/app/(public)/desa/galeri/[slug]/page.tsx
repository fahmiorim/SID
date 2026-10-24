import type { Metadata } from "next";
import { notFound as nextNotFound } from "next/navigation";

import { daftarFotoAlbum, detailAlbumGaleri } from "@/features/publik/application/konten-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/desa/galeri/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { desa } = await siapkanTema();
  const album = await detailAlbumGaleri(desa.id, slug);
  if (!album) return { title: `Album tidak ditemukan · ${desa.namaDesa ?? "Desa"}` };
  return { title: `${album.nama} · Galeri ${desa.namaDesa ?? "Desa"}` };
}

export default async function AlbumGaleriPage({ params }: PageProps<"/desa/galeri/[slug]">) {
  const { slug } = await params;
  const { ctx, tema, desa } = await siapkanTema();
  const album = await detailAlbumGaleri(desa.id, slug);

  if (!album) nextNotFound();

  const foto = await daftarFotoAlbum(desa.id, album.id);

  const GaleriDetail = tema.galeriDetail;

  return (
    <GaleriDetail
      ctx={ctx}
      album={{ id: album.id, nama: album.nama, keterangan: album.keterangan }}
      foto={foto}
    />
  );
}
