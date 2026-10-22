import Link from "next/link";

import { urlMedia } from "@/features/publik/domain/format";
import type { GaleriListProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Daftar album galeri. */
export function EsensiGaleri({ album }: GaleriListProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader title="Galeri Desa" description="Dokumentasi kegiatan dan potret desa." />

      {album.length === 0 ? (
        <ThemeEmpty>Belum ada album galeri.</ThemeEmpty>
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
