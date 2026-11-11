import type { Metadata } from "next";

import { daftarKiaPublik } from "@/features/kesehatan/application/kesehatan-publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return { title: `KIA · ${desa.namaDesa ?? "Desa"}` };
}

export default async function KiaPublikPage() {
  const { desa } = await siapkanTema();
  const rows = await daftarKiaPublik(desa.id);

  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Kesehatan Ibu dan Anak (KIA)"
        description={`Data Kartu Identitas Anak ${desa.namaDesa ?? "desa"}.`}
      />

      <ThemeCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-3 font-medium sm:px-4">No KIA</th>
                <th className="px-3 py-3 font-medium sm:px-4">Ibu</th>
                <th className="px-3 py-3 font-medium sm:px-4">Posyandu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-3 sm:px-4">{row.noKia}</td>
                  <td className="px-3 py-3 sm:px-4">{row.ibuName ?? "-"}</td>
                  <td className="px-3 py-3 sm:px-4">{row.posyanduId ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-3 py-8 text-center text-muted-foreground sm:px-4" colSpan={3}>
                    Belum ada data KIA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      <div className="flex justify-end">
        <a
          href="/desa/kesehatan/kia/ekspor"
          className="tema-link-primary inline-flex min-h-11 items-center rounded-[var(--pub-radius)] border px-4 text-sm font-medium hover:underline"
        >
          Ekspor CSV
        </a>
      </div>
    </div>
  );
}
