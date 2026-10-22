import type { Metadata } from "next";
import { notFound as nextNotFound } from "next/navigation";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { urlMedia } from "@/features/publik/domain/format";
import {
  getBeritaBySlug,
  listBerita,
  tambahHitBerita,
} from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/desa/berita/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { desa } = await siapkanTema();
  const berita = await getBeritaBySlug(desa.id, slug);
  if (!berita) return { title: `Berita tidak ditemukan · ${desa.namaDesa ?? "Desa"}` };

  return {
    title: `${berita.judul} · ${desa.namaDesa ?? "Desa"}`,
    description: berita.ringkasan ?? undefined,
    openGraph: {
      title: berita.judul,
      images: urlMedia(berita.gambar) ?? undefined,
    },
  };
}

export default async function BeritaDetailPage({ params }: PageProps<"/desa/berita/[slug]">) {
  const { slug } = await params;
  const { ctx, tema, desa } = await siapkanTema();
  const berita = await getBeritaBySlug(desa.id, slug);

  if (!berita) nextNotFound();

  // Hitungan kunjungan tidak boleh menggagalkan render.
  void tambahHitBerita(berita.id).catch(() => undefined);

  const lainnya = await listBerita(desa.id, { limit: 4 });
  const terkait = lainnya.filter((item) => item.id !== berita.id).slice(0, 3);

  const Detail = tema.beritaDetail;

  return <Detail ctx={ctx} berita={berita} terkait={terkait} />;
}
