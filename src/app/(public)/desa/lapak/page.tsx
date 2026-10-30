import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listKategoriLapak, listLapak } from "@/features/lapak/infrastructure/lapak-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lapak Desa",
  description: "Produk dan UMKM Desa",
};

export default async function LapakPublicPage() {
  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const [items, kategoriList] = await Promise.all([
    listLapak(villageId),
    listKategoriLapak(villageId),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Lapak Desa {identitas?.namaDesa ?? "Desa"}</h1>
        <p className="text-sm text-muted-foreground">
          Daftar UMKM dan produk warga {identitas?.namaDesa ?? "desa"}
        </p>
      </header>

      {kategoriList.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter: </span>
          <button className="rounded-full border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground">
            Semua
          </button>
          {kategoriList.map((k) => (
            <button
              key={k}
              className="rounded-full border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada data lapak UMKM untuk desa ini.
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
