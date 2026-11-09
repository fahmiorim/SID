import { Download, ExternalLink, FileText, Search } from "lucide-react";
import Link from "next/link";

import {
  DOKUMEN_JENIS,
  DOKUMEN_JENIS_LABELS,
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
  jenis,
  arsip,
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
    if (jenis) params.set("jenis", jenis);
    params.set("page", String(targetPage));
    return `/desa/dokumen?${params.toString()}`;
  }

  function arsipHref(tahun: number | null, jenisArsip: string | null) {
    const params = new URLSearchParams();
    if (category !== "semua") params.set("kategori", category);
    if (tahun !== null) params.set("tahun", String(tahun));
    if (jenisArsip) params.set("jenis", jenisArsip);
    const query = params.toString();
    return query ? `/desa/dokumen?${query}` : "/desa/dokumen";
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
        className="grid gap-3 border p-4 sm:grid-cols-[minmax(12rem,1fr)_12rem_12rem_8rem_auto]"
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
        <label className="sr-only" htmlFor="dokumen-jenis">
          Jenis dokumen
        </label>
        <select
          id="dokumen-jenis"
          name="jenis"
          defaultValue={jenis}
          className="min-h-10 border px-3 text-sm"
        >
          <option value="">Semua jenis</option>
          {DOKUMEN_JENIS.map((value) => (
            <option key={value} value={value}>
              {DOKUMEN_JENIS_LABELS[value]}
            </option>
          ))}
        </select>
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
          <Search className="size-4" aria-hidden="true" />
          Cari
        </button>
      </form>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total} dokumen ditemukan.
      </p>

      {arsip.length > 0 ? (
        <section className="space-y-3" aria-label="Arsip dokumen">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Arsip Dokumen</h2>
            {jenis || year !== undefined ? (
              <Link
                href={`/desa/dokumen${category !== "semua" ? `?kategori=${category}` : ""}`}
                className="tema-link-primary text-sm hover:underline"
              >
                Tampilkan semua arsip
              </Link>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {arsip.map((item) => (
              <div
                key={item.tahun ?? "tanpa-tahun"}
                className="border p-4"
                style={{ borderRadius: "var(--pub-radius)" }}
              >
                <p className="text-sm font-medium">
                  {item.tahun ?? "Tanpa tahun"}{" "}
                  <span className="text-muted-foreground">({item.jumlah})</span>
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {item.jenis.map((jenisItem) => (
                    <li key={jenisItem.jenis ?? "tanpa-jenis"}>
                      <Link
                        href={arsipHref(item.tahun, jenisItem.jenis)}
                        className="tema-link-primary hover:underline"
                      >
                        {jenisItem.label}{" "}
                        <span className="text-muted-foreground">({jenisItem.jumlah})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {dokumen.length === 0 ? (
        <ThemeEmpty>
          {search || category !== "semua" || year !== undefined || jenis
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
                  <FileText
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
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
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        ) : (
                          <Download className="size-3.5" aria-hidden="true" />
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
