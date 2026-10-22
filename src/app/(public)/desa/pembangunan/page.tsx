import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembangunan Desa",
  description: "Laporan proyek pembangunan desa dan realisasi",
};

export default async function PembangunanPage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Pembangunan Desa</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Proyek Pembangunan</h2>

        <p className="text-sm text-muted-foreground">
          Daftar proyek pembangunan desa dengan realisasi dan pagu anggaran.
        </p>

        {/* TODO: Isi dengan data dari Fase 3C */}
        <p className="text-muted-foreground">
          Belum ada data proyek pembangunan. Silakan hubungi admin untuk memasukkan data proyek.
        </p>
      </div>
    </div>
  );
}
