import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

import { formatTanggal, urlMedia } from "@/features/publik/domain/format";
import type { BeritaDetailProps } from "@/themes/types";
import { ThemeProse } from "@/themes/ui";

/** Detail berita + berita terkait + lampiran. */
export function EsensiBeritaDetail({ berita, terkait }: BeritaDetailProps) {
  const sampul = urlMedia(berita.gambar);
  const lampiran = urlMedia(berita.dokumen);

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
          <span className="tema-link-primary text-sm font-medium">{berita.kategori}</span>
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
        <img
          src={sampul}
          alt={berita.judul}
          className="w-full border object-cover"
          style={{ borderRadius: "var(--pub-radius)" }}
        />
      ) : null}

      <ThemeProse html={berita.isi} className="space-y-4 text-base leading-relaxed" />

      {lampiran ? (
        <a
          href={lampiran}
          className="inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium hover:bg-accent"
          style={{ borderRadius: "var(--pub-radius)" }}
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
                  className="font-medium hover:text-[var(--pub-primary)] hover:underline"
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
