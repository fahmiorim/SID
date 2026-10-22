import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Peta Desa",
  description: "Peta area dan batas desa",
};

export default function PetaPage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Peta Desa</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Peta Area Desa</h2>

        <p className="text-sm text-muted-foreground">
          Tampilan peta area desa dengan batas wilayah.
        </p>

        {/* TODO: Integrasi peta GIS Fase 3B */}
        <div className="rounded-border mt-4 bg-gray-50 p-4">
          <p className="text-muted-foreground">
            Peta interaktif akan segera ditampilkan. menampilkan area, garis batas, dan titik
            koordinat desa.
          </p>
        </div>
      </div>
    </div>
  );
}
