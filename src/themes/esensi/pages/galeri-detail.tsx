import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { urlMedia } from "@/features/publik/domain/format";
import type { GaleriDetailProps } from "@/themes/types";
import { ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Detail album galeri beserta foto-fotonya. */
export function EsensiGaleriDetail({ album, foto }: GaleriDetailProps) {
  return (
    <div className="space-y-8">
      <Link
        href="/desa/galeri"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke galeri
      </Link>

      <ThemePageHeader title={album.nama} description={album.keterangan} />
      <p className="text-sm text-muted-foreground">{foto.length} foto</p>

      {foto.length === 0 ? (
        <ThemeEmpty>Belum ada foto pada album ini.</ThemeEmpty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foto.map((item) => {
            const sumber = urlMedia(item.gambar);
            return (
              <li
                key={item.id}
                className="overflow-hidden border bg-card"
                style={{ borderRadius: "var(--pub-radius)" }}
              >
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
