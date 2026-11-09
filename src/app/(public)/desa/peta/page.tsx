import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { getPetaPublik } from "@/features/gis/application/use-cases";
import PetaMap from "@/features/gis/presentation/components/peta-map-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const identitas = await getIdentitasFromRequest();
  const desaName = identitas?.namaDesa ?? "Desa";

  return {
    title: `Peta ${desaName}`,
    description: `Peta interaktif desa ${desaName}`,
  };
}

export default async function PetaPage() {
  const identitas = await getIdentitasFromRequest();
  if (!identitas) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="mb-4 text-2xl font-bold">Peta Desa</h1>
        <p className="text-muted-foreground">Desa tidak ditemukan.</p>
      </div>
    );
  }

  const { areas, garises, points, polygons } = await getPetaPublik();

  const namaDesa = identitas.namaDesa ?? "Desa";

  return (
    <div className="mx-auto max-w-5xl py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Peta Desa {namaDesa}</h1>
        <Button variant="outline" asChild>
          <Link href="/desa/peta/cetak">Cetak Peta</Link>
        </Button>
      </div>
      <PetaMap
        areas={areas}
        garises={garises}
        points={points}
        polygons={polygons}
        desaName={namaDesa}
      />
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
        <div className="rounded border p-3">
          <span className="font-semibold">{polygons.length}</span> layer poligon
        </div>
        <div className="rounded border p-3">
          <span className="font-semibold">{areas.length}</span> area
        </div>
        <div className="rounded border p-3">
          <span className="font-semibold">{garises.length}</span> garis
        </div>
        <div className="rounded border p-3">
          <span className="font-semibold">{points.length}</span> titik
        </div>
      </div>
    </div>
  );
}
