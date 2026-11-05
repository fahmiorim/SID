import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listProdukPublik } from "@/features/lapak/infrastructure/lapak-produk-repository";
import { TambahKeranjangButton } from "@/features/lapak/presentation/components/tambah-keranjang-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Produk Lapak ${id}` };
}

export default async function ProdukLapakPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lapakId = Number(id);
  if (!lapakId) notFound();

  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const products = await listProdukPublik(villageId, lapakId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <Link
          href="/desa/lapak"
          className="mb-4 inline-block text-sm text-muted-foreground hover:underline"
        >
          ← Kembali ke Lapak
        </Link>
        <h1 className="text-2xl font-bold">Produk Lapak #{lapakId}</h1>
        <p className="text-sm text-muted-foreground">{products.length} produk tersedia</p>
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
                <h3 className="font-semibold">{item.nama}</h3>
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
    </div>
  );
}
