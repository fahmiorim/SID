import { ArrowLeft, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound as nextNotFound } from "next/navigation";

import { KontenHtml } from "@/app/(public)/_components/konten-html";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { formatTanggal, urlMedia } from "@/features/publik/domain/format";
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
  const desa = await getIdentitasFromRequest();
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
  const desa = await getIdentitasFromRequest();
  const berita = await getBeritaBySlug(desa.id, slug);

  if (!berita) nextNotFound();

  // Hitungan kunjungan tidak boleh menggagalkan render.
  void tambahHitBerita(berita.id).catch(() => undefined);

  const [lainnya, dokumenLampiran] = await Promise.all([
    listBerita(desa.id, { limit: 4 }),
    Promise.resolve(urlMedia(berita.dokumen)),
  ]);

  const terkait = lainnya.filter((item) => item.id !== berita.id).slice(0, 3);
  const sampul = urlMedia(berita.gambar);

  return (
    <article className="space-y-8">
      <Link
        href="/desa/berita"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar berita
      </Link>

      <header className="space-y-3">
        {berita.kategori ? (
          <span className="text-sm font-medium text-primary">{berita.kategori}</span>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{berita.judul}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time>{formatTanggal(berita.terbitPada ?? berita.createdAt)}</time>
          <span aria-hidden>·</span>
          <span>{berita.hit} kali dibaca</span>
        </div>
      </header>

      {sampul ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sampul} alt={berita.judul} className="w-full rounded-xl border object-cover" />
      ) : null}

      <KontenHtml html={berita.isi} className="space-y-4 text-base leading-relaxed" />

      {dokumenLampiran ? (
        <a
          href={dokumenLampiran}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          <FileText className="size-4" />
          Unduh lampiran
        </a>
      ) : null}

      {terkait.length > 0 ? (
        <section className="border-t pt-8">
          <h2 className="text-lg font-semibold tracking-tight">Berita lainnya</h2>
          <ul className="mt-4 space-y-3">
            {terkait.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/desa/berita/${item.slug}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {item.judul}
                </Link>
                <time className="ml-2 text-xs text-muted-foreground">
                  {formatTanggal(item.terbitPada ?? item.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
