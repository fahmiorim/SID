import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { keuangan } from "@/db/schema/keuangan";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { desa } = await siapkanTema();

  const [countResult] = await db
    .select({ value: count() })
    .from(keuangan)
    .where(eq(keuangan.villageId, desa.id));

  const total = countResult?.value ?? 0;

  return {
    title: `APBDes · ${desa.namaDesa ?? "Desa"}`,
    description: `Laporan APBDes dan keuangan desa ${desa.namaDesa ?? "desa"} (${total} catatan)`,
  };
}

export default async function APBDesPage() {
  const { desa } = await siapkanTema();
  const villageId = desa.id;

  // Ambil data keuangan (anggaran & realisasi per rekening)
  const [rows] = await db
    .select({
      id: keuangan.id,
      templateUuid: keuangan.templateUuid,
      tahun: keuangan.tahun,
      anggaran: keuangan.anggaran,
      realisasi: keuangan.realisasi,
      createdAt: keuangan.createdAt,
    })
    .from(keuangan)
    .where(eq(keuangan.villageId, villageId));

  const safeRows = (rows ?? []) as Array<{
    id: number;
    templateUuid: string;
    tahun: number;
    anggaran: string;
    realisasi: string;
    createdAt: Date;
  }>;

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Laporan Keuangan</h1>

      <p className="mb-8 text-sm text-muted-foreground">
        Total catatan anggaran: {safeRows.length}
      </p>

      {safeRows.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-muted-foreground">Belum ada data keuangan di desa ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {safeRows.map((r) => (
            <div
              key={r.id}
              className="rounded-md border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-medium">{r.templateUuid || "—"}</h3>
                <div className="text-xs text-muted-foreground">
                  <span>Tahun: {r.tahun}</span>
                  <span>Anggaran: {r.anggaran}</span>
                  <span>Realisasi: {r.realisasi}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Ditambahkan: {r.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
