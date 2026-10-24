import type { Metadata } from "next";

import { listCatatanPertanahan } from "@/features/publik/application/pertanahan-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa, ctx } = await siapkanTema();
  void ctx;

  const rows = await listCatatanPertanahan(desa.id);
  const total = rows.length;

  return {
    title: `Pertanahan · ${desa.namaDesa ?? "Desa"}`,
    description: `Data pertanahan dan persil di desa ${desa.namaDesa ?? "desa"} (${total} catatan)`,
  };
}

export default async function PertanahanPage() {
  const { desa } = await siapkanTema();
  const rows = await listCatatanPertanahan(desa.id);

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Data Pertanahan</h1>

      <p className="mb-8 text-sm text-muted-foreground">
        Total catatan: {rows.length.toLocaleString("id-ID")}
      </p>

      {rows.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-muted-foreground">Belum ada data pertanahan di desa ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-md border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-medium">{row.nama || "—"}</h3>
                <span className="text-xs text-muted-foreground">Kd: {row.kode || "—"}</span>
              </div>
              <p className="mb-1 text-xs text-muted-foreground">{row.keterangan || "—"}</p>
              <p className="text-xs text-muted-foreground">
                Ditambahkan: {row.createdAt.toLocaleDateString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
