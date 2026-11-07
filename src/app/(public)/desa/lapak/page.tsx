import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { daftarLapakPublik } from "@/features/lapak/application/lapak-publik";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const identitas = await getIdentitasFromRequest();
  const namaDesa = identitas?.namaDesa ?? "Desa";
  return {
    title: `Lapak Desa ${namaDesa}`,
    description: `Jelajahi lapak UMKM dan produk warga Desa ${namaDesa}.`,
  };
}

function buatHref(opts: { kategori?: string; q?: string; page?: number }) {
  const params = new URLSearchParams();
  if (opts.kategori) params.set("kategori", opts.kategori);
  if (opts.q) params.set("q", opts.q);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const query = params.toString();
  return query ? `/desa/lapak?${query}` : "/desa/lapak";
}

export default async function LapakPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; q?: string; page?: string | string[] }>;
}) {
  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const params = await searchParams;
  const kategori = typeof params.kategori === "string" ? params.kategori.trim() : "";
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const pageValue = Array.isArray(params.page) ? params.page[0] : params.page;
  const requestedPage = Number(pageValue);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const listing = await daftarLapakPublik(villageId, {
    kategori: kategori || undefined,
    q: q || undefined,
    page,
  });

  const { items, kategori: kategoriList, total, page: currentPage, pageCount } = listing;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Lapak Desa {identitas?.namaDesa ?? "Desa"}</h1>
        <p className="text-sm text-muted-foreground">
          Daftar UMKM dan produk warga {identitas?.namaDesa ?? "desa"}
        </p>
      </header>

      <form method="get" className="mb-4 flex flex-wrap items-center gap-2">
        {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
        <label htmlFor="lapak-search" className="sr-only">
          Cari lapak berdasarkan nama, pemilik, atau alamat
        </label>
        <input
          id="lapak-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari nama, pemilik, atau alamat"
          className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
        />
        <button
          type="submit"
          className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Cari
        </button>
        {q ? (
          <Link
            href={buatHref({ kategori: kategori || undefined })}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Hapus pencarian
          </Link>
        ) : null}
      </form>

      {kategoriList.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          <Link
            href={buatHref({ q: q || undefined })}
            className={
              kategori
                ? "rounded-full border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                : "rounded-full border bg-primary px-3 py-1 text-sm text-primary-foreground"
            }
          >
            Semua
          </Link>
          {kategoriList.map((k) => (
            <Link
              key={k}
              href={buatHref({ kategori: k, q: q || undefined })}
              className={
                kategori === k
                  ? "rounded-full border bg-primary px-3 py-1 text-sm text-primary-foreground"
                  : "rounded-full border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
              }
            >
              {k}
            </Link>
          ))}
        </div>
      )}

      <p className="mb-3 text-sm text-muted-foreground">
        {total} lapak ditemukan{kategori ? ` pada kategori "${kategori}"` : ""}.
      </p>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada data lapak UMKM yang cocok.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-4">
                <h3 className="truncate font-semibold">{item.nama}</h3>
                {item.kategori && (
                  <span className="mt-1 inline-block rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {item.kategori}
                  </span>
                )}
                {item.pemilik && (
                  <p className="mt-1 text-sm text-muted-foreground">Pemilik: {item.pemilik}</p>
                )}
                {item.alamat && (
                  <p className="mt-1 truncate text-sm text-muted-foreground">📍 {item.alamat}</p>
                )}
                {item.keterangan && (
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {item.keterangan}
                  </p>
                )}
                {item.produkCount > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {item.produkCount} produk tersedia
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/desa/lapak/${item.id}/produk`}>Lihat Produk</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/desa/lapak/peta">Peta</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {pageCount > 1 && (
        <nav
          aria-label="Navigasi halaman lapak"
          className="mt-6 flex items-center justify-center gap-4 text-sm"
        >
          {currentPage > 1 ? (
            <Link
              href={buatHref({
                kategori: kategori || undefined,
                q: q || undefined,
                page: currentPage - 1,
              })}
              rel="prev"
              className="underline underline-offset-4"
            >
              Sebelumnya
            </Link>
          ) : (
            <span className="text-muted-foreground">Sebelumnya</span>
          )}
          <span>
            Halaman {currentPage} dari {pageCount}
          </span>
          {currentPage < pageCount ? (
            <Link
              href={buatHref({
                kategori: kategori || undefined,
                q: q || undefined,
                page: currentPage + 1,
              })}
              rel="next"
              className="underline underline-offset-4"
            >
              Berikutnya
            </Link>
          ) : (
            <span className="text-muted-foreground">Berikutnya</span>
          )}
        </nav>
      )}
    </div>
  );
}
