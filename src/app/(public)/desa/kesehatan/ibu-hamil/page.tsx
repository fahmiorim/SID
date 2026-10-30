import type { Metadata } from "next";

import { listIbuHamil } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return { title: `Ibu Hamil · ${desa.namaDesa ?? "Desa"}` };
}

export default async function IbuHamilPublikPage() {
  const { desa } = await siapkanTema();
  const rows = await listIbuHamil(desa.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Pemantauan Ibu Hamil</h1>
        <p className="text-sm text-muted-foreground">
          {desa.namaDesa ?? "Desa"} — Data pemantauan ibu hamil
        </p>
      </header>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Posyandu</th>
                <th className="p-2 text-left">Status Kehamilan</th>
                <th className="p-2 text-left">Usia Kehamilan</th>
                <th className="p-2 text-left">Pemeriksaan</th>
                <th className="p-2 text-left">Pil Fe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="p-2">{row.posyanduId}</td>
                  <td className="p-2">
                    {row.statusKehamilan === 1
                      ? "Normal"
                      : row.statusKehamilan === 2
                        ? "Risiko Tinggi"
                        : row.statusKehamilan === 3
                          ? "KEK"
                          : "-"}
                  </td>
                  <td className="p-2">{row.usiaKehamilan ?? "-"}</td>
                  <td className="p-2">{row.pemeriksaanKehamilan ? "Ya" : "Tidak"}</td>
                  <td className="p-2">{row.konsumsiPilFe ? "Ya" : "Tidak"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-muted-foreground" colSpan={5}>
                    Belum ada data ibu hamil.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <a
          href="/desa/kesehatan/ibu-hamil/ekspor"
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Ekspor CSV
        </a>
      </div>
    </div>
  );
}
