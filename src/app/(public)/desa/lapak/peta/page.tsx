import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listProdukDenganKoordinat } from "@/features/lapak/infrastructure/lapak-produk-repository";
import PetaProdukMap from "@/features/lapak/presentation/components/peta-produk-map";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Peta Produk UMKM",
  description: "Peta lokasi produk UMKM desa",
};

export default async function PetaLapakPage() {
  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const produkList = await listProdukDenganKoordinat(villageId);

  const namaDesa = identitas?.namaDesa ?? "Desa";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Peta Produk UMKM</h1>
        <p className="text-sm text-muted-foreground">Lokasi produk dan lapak di {namaDesa}</p>
      </header>

      {produkList.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Belum ada produk dengan koordinat lokasi.
        </div>
      ) : (
        <>
          <PetaProdukMap
            items={produkList.map((p) => ({
              nama: p.nama,
              lapakNama: p.lapakNama ?? "Tanpa lapak",
              harga: p.harga,
              lat: parseFloat(p.latitude!),
              lng: parseFloat(p.longitude!),
            }))}
            desaName={namaDesa}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {produkList.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{item.nama}</h3>
                {item.lapakNama && (
                  <p className="text-sm text-muted-foreground">Lapak: {item.lapakNama}</p>
                )}
                <p className="mt-1 font-medium">Rp {Number(item.harga).toLocaleString("id-ID")}</p>
                {item.deskripsi && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {item.deskripsi}
                  </p>
                )}
                {item.latitude && item.longitude && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    📍 {item.latitude}, {item.longitude}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
