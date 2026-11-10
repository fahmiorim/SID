import { Map as MapIcon } from "lucide-react";

import PetaMap from "@/features/gis/presentation/components/peta-map-client";
import type { PetaProps } from "@/themes/types";
import { ThemeButton, ThemeCard, ThemePageHeader, ThemeStatGrid } from "@/themes/ui";

/** Peta interaktif desa beserta ringkasan layer yang tersedia. */
export function EsensiPeta({ ctx, peta }: PetaProps) {
  const { areas, garises, points, polygons } = peta;
  const namaDesa = ctx.desa.namaDesa ?? "Desa";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ThemePageHeader
          title={`Peta ${namaDesa}`}
          description="Batas wilayah, jalan, dan titik penting desa dalam satu tampilan."
          eyebrow="Wilayah"
        />
        <ThemeButton href="/desa/peta/cetak" variant="outline">
          Cetak Peta
        </ThemeButton>
      </div>

      <ThemeCard className="p-3">
        <PetaMap
          areas={areas}
          garises={garises}
          points={points}
          polygons={polygons}
          desaName={namaDesa}
        />
      </ThemeCard>

      {polygons.length + areas.length + garises.length + points.length === 0 ? (
        <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          <MapIcon className="size-4" aria-hidden="true" />
          Data peta desa belum diisi.
        </p>
      ) : (
        <ThemeStatGrid
          items={[
            { label: "Layer poligon", nilai: polygons.length },
            { label: "Area", nilai: areas.length },
            { label: "Garis", nilai: garises.length },
            { label: "Titik", nilai: points.length },
          ]}
        />
      )}
    </div>
  );
}
