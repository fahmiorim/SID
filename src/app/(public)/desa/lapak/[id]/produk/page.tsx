import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listProdukPublik } from "@/features/lapak/infrastructure/lapak-produk-repository";
import { findLapak } from "@/features/lapak/infrastructure/lapak-repository";
import { TambahKeranjangButton } from "@/features/lapak/presentation/components/tambah-keranjang-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lapakId = Number(id);
  if (!Number.isInteger(lapakId) || lapakId < 1) return { title: "Lapak UMKM" };
  const identitas = await getIdentitasFromRequest();
  if (!identitas?.id) return { title: "Lapak UMKM" };
  const lapak = await findLapak(identitas.id, lapakId);
  if (!lapak) return { title: "Lapak UMKM" };
  const description =
    lapak.keterangan?.trim() ||
    `Lihat produk UMKM yang tersedia di lapak ${lapak.nama} di Desa ${identitas.namaDesa}.`;
  return { title: `${lapak.nama} | Produk UMKM`, description };
}

export default async function ProdukLapakPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { id } = await params;
  const lapakId = Number(id);
  if (!Number.isInteger(lapakId) || lapakId < 1) notFound();

  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const lapak = await findLapak(villageId, lapakId);
  if (!lapak) notFound();
  const paramsSearch = await searchParams;
  const pageValue = Array.isArray(paramsSearch.page) ? paramsSearch.page[0] : paramsSearch.page;
  const requestedPage = Number(pageValue);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const productsPage = await listProdukPublik(villageId, lapakId, { page });
  const { rows: products, total, page: currentPage, pageCount } = productsPage;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <Link
          href="/desa/lapak"
          className="mb-4 inline-block text-sm text-muted-foreground hover:underline"
        >
          ← Kembali ke Lapak
        </Link>
        <h1 className="text-2xl font-bold">Produk Lapak {lapak.nama}</h1>
        <p className="text-sm text-muted-foreground">{total} produk tersedia</p>
      </header>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada produk di lapak ini.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-4">
                {item.gambar && (
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    className="mb-3 h-40 w-full rounded object-cover"
                  />
                )}
                <h2 className="font-semibold">{item.nama}</h2>
                <p className="mt-1 text-lg font-bold">
                  Rp {Number(item.harga).toLocaleString("id-ID")}
                </p>
                {item.deskripsi && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {item.deskripsi}
                  </p>
                )}
                {item.stok !== null && item.stok !== undefined && (
                  <p className="mt-1 text-xs text-muted-foreground">Stok: {item.stok}</p>
                )}
                <div className="mt-auto pt-4">
                  <TambahKeranjangButton lapakId={item.lapakId} produkId={item.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {pageCount > 1 && (
        <nav
          aria-label="Navigasi halaman produk"
          className="mt-6 flex items-center justify-center gap-4 text-sm"
        >
          {currentPage > 1 ? (
            <Link
              href={`?page=${currentPage - 1}`}
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
              href={`?page=${currentPage + 1}`}
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
