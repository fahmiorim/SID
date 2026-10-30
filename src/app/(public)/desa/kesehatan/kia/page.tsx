import type { Metadata } from "next";

import { listKia } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return { title: `KIA · ${desa.namaDesa ?? "Desa"}` };
}

export default async function KiaPublikPage() {
  const { desa } = await siapkanTema();
  const rows = await listKia(desa.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Kesehatan Ibu dan Anak (KIA)</h1>
        <p className="text-sm text-muted-foreground">
          {desa.namaDesa ?? "Desa"} — Data Kartu Identitas Anak
        </p>
      </header>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">No KIA</th>
                <th className="p-2 text-left">Ibu</th>
                <th className="p-2 text-left">Posyandu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="p-2">{row.noKia}</td>
                  <td className="p-2">{row.ibuName ?? "-"}</td>
                  <td className="p-2">{row.posyanduId ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-muted-foreground" colSpan={3}>
                    Belum ada data KIA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <a
          href="/desa/kesehatan/kia/ekspor"
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Ekspor CSV
        </a>
      </div>
    </div>
  );
}
