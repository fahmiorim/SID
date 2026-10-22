import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { inventaris } from "@/db/schema";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { desa } = await siapkanTema();

  const [countResult] = await db
    .select({ value: count() })
    .from(inventaris)
    .where(eq(inventaris.villageId, desa.id));

  const total = countResult?.value ?? 0;

  return {
    title: `Pertanahan · ${desa.namaDesa ?? "Desa"}`,
    description: `Data pertanahan dan persil di desa ${desa.namaDesa ?? "desa"} (${total} catatan)`,
  };
}

export default async function PertanahaPage() {
  const { desa } = await siapkanTema();
  const villageId = desa.id;

  // Ambil data inventaris
  const result = await db
    .select({
      id: inventaris.id,
      nama: inventaris.namaBarang,
      kode: inventaris.kodeBarang,
      keterangan: inventaris.keterangan,
      createdAt: inventaris.createdAt,
    })
    .from(inventaris)
    .where(eq(inventaris.villageId, villageId));

  // Type assertion: result adalah array of rows atau empty
  const rows: Array<{
    id: number;
    nama: string;
    kode: string | null;
    keterangan: string | null;
    createdAt: Date;
  }> = result;

  const formatNumber = (num: number) => num.toLocaleString("id-ID");

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Data Pertanahan</h1>

      <p className="mb-8 text-sm text-muted-foreground">
        Total catatan inventaris: {formatNumber(rows.length)}
      </p>

      {rows.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-muted-foreground">Belum ada data inventaris di desa ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-md border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-medium">{r.nama || "—"}</h3>
                <span className="text-xs text-muted-foreground">Kd: {r.kode || "—"}</span>
              </div>
              <p className="mb-1 text-xs text-muted-foreground">{r.keterangan || "—"}</p>
              <p className="text-xs text-muted-foreground">
                Ditambahkan: {r.createdAt.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
