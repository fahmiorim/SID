import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "@/components/shared/print-button";
import { Button } from "@/components/ui/button";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { getPetaPublik } from "@/features/gis/application/use-cases";
import { bangunPetaCetak, type LayerCetak } from "@/features/gis/domain/peta-cetak";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cetak Peta Desa",
  description: "Peta desa siap cetak beserta legenda layer",
};

function LayerSvg({ layer }: { layer: LayerCetak }) {
  if (layer.jenis === "area") {
    return (
      <polygon
        points={layer.titik.map((titik) => `${titik.x},${titik.y}`).join(" ")}
        fill={layer.warna}
        fillOpacity={0.25}
        stroke={layer.warna}
        strokeWidth={1.5}
      />
    );
  }

  if (layer.jenis === "garis") {
    return (
      <polyline
        points={layer.titik.map((titik) => `${titik.x},${titik.y}`).join(" ")}
        fill="none"
        stroke={layer.warna}
        strokeWidth={2}
      />
    );
  }

  const titik = layer.titik[0];
  if (!titik) return null;
  return <circle cx={titik.x} cy={titik.y} r={4} fill={layer.warna} />;
}

export default async function PetaCetakPage() {
  const identitas = await getIdentitasFromRequest();
  if (!identitas) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="mb-4 text-2xl font-bold">Cetak Peta Desa</h1>
        <p className="text-muted-foreground">Desa tidak ditemukan.</p>
      </div>
    );
  }

  const data = await getPetaPublik();
  const peta = bangunPetaCetak(data);
  const namaDesa = identitas.namaDesa ?? "Desa";
  const tanggal = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Peta Desa {namaDesa}</h1>
          <p className="text-sm text-muted-foreground">
            Dicetak {tanggal} · {peta.layers.length} layer
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" asChild>
            <Link href="/desa/peta">Kembali ke peta</Link>
          </Button>
          <PrintButton />
        </div>
      </div>

      {peta.kosong ? (
        <p className="rounded-lg border p-8 text-center text-muted-foreground">
          Belum ada data area, garis, atau titik untuk dicetak.
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${peta.lebar} ${peta.tinggi}`}
            role="img"
            aria-label={`Peta desa ${namaDesa}`}
            className="h-auto w-full rounded-lg border bg-white"
          >
            {peta.layers.map((layer) => (
              <LayerSvg key={layer.id} layer={layer} />
            ))}
          </svg>

          <div className="rounded-lg border p-4">
            <p className="mb-2 text-sm font-semibold">Legenda</p>
            <ul className="grid gap-2 text-sm sm:grid-cols-3">
              {peta.legenda.map((item) => (
                <li key={`${item.jenis}-${item.nama}`} className="flex items-center gap-2">
                  <span
                    className="inline-block size-4 rounded-sm border"
                    style={{ backgroundColor: item.warna }}
                    aria-hidden
                  />
                  <span>
                    {item.nama}
                    <span className="text-muted-foreground"> · {item.jenis}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Sumber: data layer peta desa. Peta ini digambar tanpa tile daring agar tetap tampil saat
        dicetak.
      </p>
    </div>
  );
}
