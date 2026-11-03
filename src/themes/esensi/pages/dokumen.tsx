import { Download, ExternalLink, FileText, Search } from "lucide-react";
import Link from "next/link";

import {
  DOKUMEN_KATEGORI_FILTERS,
  DOKUMEN_KATEGORI_LABELS,
  isHttpsEmbedUrl,
  isSafeDocumentLink,
  type DokumenKategori,
} from "@/features/publik/domain/dokumen";
import { urlMedia } from "@/features/publik/domain/format";
import type { DokumenProps } from "@/themes/types";
import { ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Informasi publik & produk hukum. */
export function EsensiDokumen({
  dokumen,
  search,
  category,
  year,
  page,
  pageSize,
  total,
}: DokumenProps) {
  const pages = Math.ceil(total / pageSize);

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "semua") params.set("kategori", category);
    if (year !== undefined) params.set("tahun", String(year));
    params.set("page", String(targetPage));
    return `/desa/dokumen?${params.toString()}`;
  }

  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Informasi Publik"
        description="Dokumen resmi desa, produk hukum, dan peraturan yang dapat diakses warga."
      />

      <form
        method="get"
        action="/desa/dokumen"
        className="grid gap-3 border p-4 sm:grid-cols-[minmax(12rem,1fr)_12rem_8rem_auto]"
        style={{ borderRadius: "var(--pub-radius)" }}
      >
        <label className="sr-only" htmlFor="dokumen-q">
          Cari dokumen
        </label>
        <input
          id="dokumen-q"
          type="search"
          name="q"
          maxLength={100}
          defaultValue={search}
          placeholder="Cari nama, nomor, atau keterangan"
          className="min-h-10 border px-3 text-sm"
        />
        <label className="sr-only" htmlFor="dokumen-kategori">
          Kategori dokumen
        </label>
        <select
          id="dokumen-kategori"
          name="kategori"
          defaultValue={category}
          className="min-h-10 border px-3 text-sm"
        >
          {DOKUMEN_KATEGORI_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="dokumen-tahun">
          Tahun dokumen
        </label>
        <input
          id="dokumen-tahun"
          type="number"
          name="tahun"
          min={1900}
          max={2100}
          defaultValue={year}
          placeholder="Tahun"
          className="min-h-10 border px-3 text-sm"
        />
        <button
          type="submit"
          className="tema-button-primary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-medium"
        >
          <Search className="size-4" />
          Cari
        </button>
      </form>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total} dokumen ditemukan.
      </p>

      {dokumen.length === 0 ? (
        <ThemeEmpty>
          {search || category !== "semua" || year !== undefined
            ? "Tidak ada dokumen yang cocok dengan filter."
            : "Arsip dokumen belum tersedia."}
        </ThemeEmpty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {dokumen.map((item) => {
            const berkas = urlMedia(item.berkas);
            const safeTautan = item.tautan && isSafeDocumentLink(item.tautan) ? item.tautan : null;
            const tautan = berkas ?? safeTautan;
            const eksternal = !berkas && Boolean(safeTautan?.startsWith("http"));
            const isEmbed = item.kategori === "embed";
            const safeEmbedUrl =
              isEmbed && safeTautan && isHttpsEmbedUrl(safeTautan) ? safeTautan : null;
            const kategoriLabel =
              DOKUMEN_KATEGORI_LABELS[item.kategori as DokumenKategori] ?? item.kategori;

            return (
              <li
                key={item.id}
                className="border p-4"
                style={{ borderRadius: "var(--pub-radius)" }}
              >
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.nama}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[kategoriLabel, item.jenis, item.nomor, item.tahun]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {item.keterangan ? (
                      <p className="mt-2 text-sm text-muted-foreground">{item.keterangan}</p>
                    ) : null}
                    {tautan ? (
                      <a
                        href={tautan}
                        target={eksternal ? "_blank" : undefined}
                        rel={eksternal ? "noopener noreferrer" : undefined}
                        className="tema-link-primary mt-3 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                      >
                        {eksternal ? (
                          <ExternalLink className="size-3.5" />
                        ) : (
                          <Download className="size-3.5" />
                        )}
                        {eksternal ? "Buka tautan" : "Unduh"}
                      </a>
                    ) : null}
                    {safeEmbedUrl ? (
                      <iframe
                        src={safeEmbedUrl}
                        title={`Sematan: ${item.nama}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        sandbox=""
                        className="mt-4 h-96 w-full border"
                      />
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label="Halaman dokumen" className="flex items-center justify-between gap-4">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="tema-link-primary text-sm hover:underline">
              Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className="tema-link-primary text-sm hover:underline">
              Berikutnya
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
