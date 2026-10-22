import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound as nextNotFound } from "next/navigation";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { urlMedia } from "@/features/publik/domain/format";
import { getAlbumBySlug, listFotoAlbum } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/desa/galeri/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const desa = await getIdentitasFromRequest();
  const album = await getAlbumBySlug(desa.id, slug);
  if (!album) return { title: `Album tidak ditemukan · ${desa.namaDesa ?? "Desa"}` };
  return { title: `${album.nama} · Galeri ${desa.namaDesa ?? "Desa"}` };
}

export default async function AlbumGaleriPage({ params }: PageProps<"/desa/galeri/[slug]">) {
  const { slug } = await params;
  const desa = await getIdentitasFromRequest();
  const album = await getAlbumBySlug(desa.id, slug);

  if (!album) nextNotFound();

  const foto = await listFotoAlbum(desa.id, album.id);

  return (
    <div className="space-y-8">
      <Link
        href="/desa/galeri"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke galeri
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{album.nama}</h1>
        {album.keterangan ? <p className="text-muted-foreground">{album.keterangan}</p> : null}
        <p className="text-sm text-muted-foreground">{foto.length} foto</p>
      </header>

      {foto.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada foto pada album ini.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foto.map((item) => {
            const sumber = urlMedia(item.gambar);
            return (
              <li key={item.id} className="overflow-hidden rounded-xl border bg-card">
                {sumber ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sumber}
                    alt={item.judul ?? album.nama}
                    className="aspect-square w-full object-cover"
                  />
                ) : null}
                {item.judul ? <p className="p-3 text-sm font-medium">{item.judul}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
