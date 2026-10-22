import type { Metadata } from "next";
import { notFound as nextNotFound } from "next/navigation";

import { KontenHtml } from "@/app/(public)/_components/konten-html";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
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
  const desa = await getIdentitasFromRequest();
  const halaman = await getHalamanBySlug(desa.id, slug);

  if (!halaman) nextNotFound();

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{halaman.judul}</h1>
      </header>
      <KontenHtml html={halaman.isi} className="space-y-4 text-base leading-relaxed" />
    </article>
  );
}
