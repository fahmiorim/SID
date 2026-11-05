import Link from "next/link";

import { urlMedia } from "@/features/publik/domain/format";
import type { GaleriListProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Daftar album galeri. */
export function EsensiGaleri({ album, cari }: GaleriListProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader title="Galeri Desa" description="Dokumentasi kegiatan dan potret desa." />

      <form method="get" action="/desa/galeri" className="flex gap-2" aria-label="Cari album">
        <label htmlFor="galeri-search" className="sr-only">
          Cari album
        </label>
        <input
          id="galeri-search"
          type="search"
          name="q"
          defaultValue={cari}
          placeholder="Cari nama atau keterangan album"
          className="min-h-10 flex-1 border px-3 text-sm"
        />
        <button
          type="submit"
          className="tema-button-primary inline-flex min-h-10 items-center gap-2 px-4 text-sm font-medium"
        >
          Cari
        </button>
      </form>

      {album.length === 0 ? (
        <ThemeEmpty>
          {cari
            ? "Tidak ada album yang cocok dengan kata kunci tersebut."
            : "Belum ada album galeri."}
        </ThemeEmpty>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {album.map((item) => {
            const sampul = urlMedia(item.sampul);
            return (
              <ThemeCard as="li" key={item.id} className="transition-shadow hover:shadow-md">
                <Link href={`/desa/galeri/${item.slug}`} className="group block h-full">
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
                    <h2 className="font-medium group-hover:underline">{item.nama}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.jumlahFoto} foto</p>
                  </div>
                </Link>
              </ThemeCard>
            );
          })}
        </ul>
      )}
    </div>
  );
}
