import Link from "next/link";

import { formatTanggal, ringkasTeks, urlMedia } from "@/features/publik/domain/format";
import type { BeritaListProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Daftar berita dengan filter kategori. */
export function EsensiBerita({ berita, kategori, kategoriAktif }: BeritaListProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Berita Desa"
        description="Kabar terbaru, pengumuman, dan kegiatan desa."
      />

      {kategori.length > 0 ? (
        <nav className="flex flex-wrap gap-2" aria-label="Filter kategori">
          <Link
            href="/desa/berita"
            className="rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent"
            style={
              kategoriAktif
                ? undefined
                : {
                    backgroundColor: "var(--pub-primary)",
                    color: "var(--pub-primary-foreground)",
                  }
            }
          >
            Semua
          </Link>
          {kategori.map((item) => (
            <Link
              key={item.id}
              href={`/desa/berita?kategori=${encodeURIComponent(item.slug)}`}
              className="rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent"
              style={
                kategoriAktif === item.slug
                  ? {
                      backgroundColor: "var(--pub-primary)",
                      color: "var(--pub-primary-foreground)",
                    }
                  : undefined
              }
            >
              {item.nama}
            </Link>
          ))}
        </nav>
      ) : null}

      {berita.length === 0 ? (
        <ThemeEmpty>Belum ada berita yang dipublikasikan.</ThemeEmpty>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {berita.map((item) => {
            const sampul = urlMedia(item.gambar);
            return (
              <ThemeCard as="li" key={item.id} className="transition-shadow hover:shadow-md">
                <Link href={`/desa/berita/${item.slug}`} className="group block h-full">
                  {sampul ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sampul}
                      alt={item.judul}
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}
                  <div className="p-4">
                    {item.kategori ? (
                      <span className="tema-link-primary text-xs font-medium">{item.kategori}</span>
                    ) : null}
                    <h2 className="mt-1 line-clamp-2 font-medium group-hover:underline">
                      {item.judul}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {ringkasTeks(item.ringkasan, 140)}
                    </p>
                    <time className="mt-3 block text-xs text-muted-foreground">
                      {formatTanggal(item.terbitPada ?? item.createdAt)}
                    </time>
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
