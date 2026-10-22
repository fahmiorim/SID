import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db";
import { survey } from "@/db/schema";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analisis & Survei",
  description: "Hasil survei dan analisis masyarakat desa",
};

export default async function AnalisisSurveiPage() {
  const { desa } = await siapkanTema();
  const villageId = desa.id;

  const surveys = await db
    .select({
      id: survey.id,
      judul: survey.judul,
      deskripsi: survey.deskripsi,
    })
    .from(survey)
    .where(eq(survey.villageId, villageId));

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="mb-12 text-2xl font-bold">Analisis & Survei</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-medium mb-4">Survei Teraktif</h2>

        {surveys.length === 0 ? (
          <p className="text-muted-foreground">Belum ada survei yang diaktifkan untuk desa ini.</p>
        ) : (
          <div>
            {surveys.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-4">
                <h3 className="text-semibold">{s.judul}</h3>
                <p className="text-sm text-muted-foreground">{s.deskripsi || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
