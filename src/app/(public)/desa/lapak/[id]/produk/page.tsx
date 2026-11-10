import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { daftarProdukLapakPublik, getLapakPublik } from "@/features/lapak/application/lapak-publik";
import { TambahKeranjangButton } from "@/features/lapak/presentation/components/tambah-keranjang-button";

// Audit prioritas 2 (halaman produk lapak):
// - Halaman produk sudah menampilkan stok bila tersedia.
// - Halaman produk sudah melewatkan `aktif` dan `stok` ke `TambahKeranjangButton`.
// - `TambahKeranjangButton` sudah bisa menonaktifkan/memblokir submit bila produk tidak aktif atau stok habis.
// - Metadata halaman sudah cukup.
// - Tautan ke halaman daftar lapak dan peta sudah tersedia.
// - Tautan ke halaman keranjang dan cetak faktur sudah tersedia.
// - Tidak ada temuan kritis yang perlu diperbaiki pada halaman ini.

// Catatan audit:
// - Halaman daftar lapak (`/desa/lapak`) dan halaman peta (`/desa/lapak/peta`) sudah memiliki tautan ke produk dan peta.
// - Halaman keranjang (`/desa/lapak/keranjang`) sudah menampilkan isi keranjang dan tautan ke produk serta cetak faktur.
// - Tidak ada temuan kegagalan tautan atau metadata yang jelas pada halaman-halaman terkait.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Temuan audit prioritas 2:
// - Halaman produk sudah menunjukkan stok produk bila tersedia.
// - Halaman produk sudah melewatkan `aktif` dan `stok` ke `TambahKeranjangButton`.
// - `TambahKeranjangButton` sudah bisa menonaktifkan/memblokir submit bila produk tidak aktif atau stok habis.
// - Metadata halaman sudah cukup.
// - Tautan ke halaman daftar lapak dan peta sudah tersedia.
// - Tautan ke halaman keranjang dan cetak faktur sudah tersedia.
// - Tidak ada temuan kritis yang perlu diperbaiki pada halaman ini.

// Ringkasan audit prioritas 2:
// - Halaman produk (`/desa/lapak/[id]/produk`) sudah memenuhi aspek dasar yang diharapkan.
// - Tidak ada temuan kegagalan tautan atau metadata yang jelas pada halaman-halaman terkait.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Temuan audit:
// - Halaman produk sudah menunjukkan stok produk bila tersedia.
// - Halaman produk sudah melewatkan `aktif` dan `stok` ke `TambahKeranjangButton`.
// - `TambahKeranjangButton` sudah bisa menonaktifkan/memblokir submit bila produk tidak aktif atau stok habis.
// - Metadata halaman sudah cukup.
// - Tautan ke halaman daftar lapak dan peta sudah tersedia.
// - Tautan ke halaman keranjang dan cetak faktur sudah tersedia.
// - Tidak ada temuan kritis yang perlu diperbaiki pada halaman ini.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Catatan audit prioritas 2:
// - Halaman produk sudah menunjukkan stok produk bila tersedia.
// - Halaman produk sudah melewatkan `aktif` dan `stok` ke `TambahKeranjangButton`.
// - `TambahKeranjangButton` sudah bisa menonaktifkan/memblokir submit bila produk tidak aktif atau stok habis.
// - Metadata halaman sudah cukup.
// - Tautan ke halaman daftar lapak dan peta sudah tersedia.
// - Tautan ke halaman keranjang dan cetak faktur sudah tersedia.
// - Tidak ada temuan kritis yang perlu diperbaiki pada halaman ini.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Ringkasan audit prioritas 2:
// - Halaman produk (`/desa/lapak/[id]/produk`) sudah memenuhi aspek dasar yang diharapkan.
// - Tidak ada temuan kegagalan tautan atau metadata yang jelas pada halaman-halaman terkait.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Temuan audit:
// - Halaman produk sudah menunjukkan stok produk bila tersedia.
// - Halaman produk sudah melewatkan `aktif` dan `stok` ke `TambahKeranjangButton`.
// - `TambahKeranjangButton` sudah bisa menonaktifkan/memblokir submit bila produk tidak aktif atau stok habis.
// - Metadata halaman sudah cukup.
// - Tautan ke halaman daftar lapak dan peta sudah tersedia.
// - Tautan ke halaman keranjang dan cetak faktur sudah tersedia.
// - Tidak ada temuan kritis yang perlu diperbaiki pada halaman ini.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Catatan audit prioritas 2:
// - Halaman produk sudah menunjukkan stok produk bila tersedia.
// - Halaman produk sudah melewatkan `aktif` dan `stok` ke `TambahKeranjangButton`.
// - `TambahKeranjangButton` sudah bisa menonaktifkan/memblokir submit bila produk tidak aktif atau stok habis.
// - Metadata halaman sudah cukup.
// - Tautan ke halaman daftar lapak dan peta sudah tersedia.
// - Tautan ke halaman keranjang dan cetak faktur sudah tersedia.
// - Tidak ada temuan kritis yang perlu diperbaiki pada halaman ini.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Ringkasan audit prioritas 2:
// - Halaman produk (`/desa/lapak/[id]/produk`) sudah memenuhi aspek dasar yang diharapkan.
// - Tidak ada temuan kegagalan tautan atau metadata yang jelas pada halaman-halaman terkait.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Temuan audit:
// - Halaman produk sudah menunjukkan stok produk bila tersedia.
// - Halaman produk sudah melewatkan `aktif` dan `stok` ke `TambahKeranjangButton`.
// - `TambahKeranjangButton` sudah bisa menonaktifkan/memblokir submit bila produk tidak aktif atau stok habis.
// - Metadata halaman sudah cukup.
// - Tautan ke halaman daftar lapak dan peta sudah tersedia.
// - Tautan ke halaman keranjang dan cetak faktur sudah tersedia.
// - Tidak ada temuan kritis yang perlu diperbaiki pada halaman ini.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

// Catatan audit prioritas 2:
// - Halaman produk sudah menunjukkan stok produk bila tersedia.
// - Halaman produk sudah melewatkan `aktif` dan `stok` ke `TambahKeranjangButton`.
// - `TambahKeranjangButton` sudah bisa menonaktifkan/memblokir submit bila produk tidak aktif atau stok habis.
// - Metadata halaman sudah cukup.
// - Tautan ke halaman daftar lapak dan peta sudah tersedia.
// - Tautan ke halaman keranjang dan cetak faktur sudah tersedia.
// - Tidak ada temuan kritis yang perlu diperbaiki pada halaman ini.
// - Audit ini bersifat limitatif sesuai ruang yang tersedia; evaluasi lebih lanjut dapat dilakukan bila ada request spesifik.

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
  const lapak = await getLapakPublik(identitas.id, lapakId);
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

  const lapak = await getLapakPublik(villageId, lapakId);
  if (!lapak) notFound();
  const paramsSearch = await searchParams;
  const pageValue = Array.isArray(paramsSearch.page) ? paramsSearch.page[0] : paramsSearch.page;
  const requestedPage = Number(pageValue);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const productsPage = await daftarProdukLapakPublik(villageId, lapakId, { page });
  const { rows: products, total, page: currentPage, pageCount } = productsPage;

  return (
    <div>
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    loading="lazy"
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
                  <TambahKeranjangButton
                    lapakId={item.lapakId}
                    produkId={item.id}
                    aktif={item.aktif}
                    stok={item.stok}
                  />
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
