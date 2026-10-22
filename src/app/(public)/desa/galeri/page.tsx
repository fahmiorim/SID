import type { Metadata } from "next";
import Link from "next/link";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { urlMedia } from "@/features/publik/domain/format";
import { listAlbumGaleri } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const desa = await getIdentitasFromRequest();
  return {
    title: `Galeri Desa · ${desa.namaDesa ?? "Desa"}`,
    description: `Dokumentasi kegiatan dan potret ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function GaleriPage() {
  const desa = await getIdentitasFromRequest();
  const album = await listAlbumGaleri(desa.id);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Galeri Desa</h1>
        <p className="text-muted-foreground">Dokumentasi kegiatan dan potret desa.</p>
      </header>

      {album.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada album galeri.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {album.map((item) => {
            const sampul = urlMedia(item.sampul);
            return (
              <li key={item.id}>
                <Link
                  href={`/desa/galeri/${item.slug}`}
                  className="group block h-full overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  {sampul ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sampul}
                      alt={item.nama}
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                      Tanpa sampul
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="font-medium group-hover:text-primary">{item.nama}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.jumlahFoto} foto</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
