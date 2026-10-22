import type { Metadata } from "next";
import { notFound as nextNotFound } from "next/navigation";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { getHalamanBySlug } from "@/features/publik/infrastructure/content-repository";
import { teksPolos } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/desa/halaman/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const desa = await getIdentitasFromRequest();
  const halaman = await getHalamanBySlug(desa.id, slug);
  if (!halaman) return { title: `Halaman tidak ditemukan · ${desa.namaDesa ?? "Desa"}` };
  return {
    title: `${halaman.judul} · ${desa.namaDesa ?? "Desa"}`,
    description: teksPolos(halaman.isi).slice(0, 160),
  };
}

export default async function HalamanStatisPage({ params }: PageProps<"/desa/halaman/[slug]">) {
  const { slug } = await params;
  const { ctx, tema, desa } = await siapkanTema();
  const halaman = await getHalamanBySlug(desa.id, slug);

  if (!halaman) nextNotFound();

  const Halaman = tema.halaman;

  return <Halaman ctx={ctx} judul={halaman.judul} isi={halaman.isi} />;
}
