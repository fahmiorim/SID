import type { Metadata } from "next";

import { listBulananAnak } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return { title: `Pemantauan Anak · ${desa.namaDesa ?? "Desa"}` };
}

export default async function PemantauanAnakPublikPage() {
  const { desa } = await siapkanTema();
  const rows = await listBulananAnak(desa.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Pemantauan Anak (Bulanan)</h1>
        <p className="text-sm text-muted-foreground">
          {desa.namaDesa ?? "Desa"} — Data pemantauan bulanan anak
        </p>
      </header>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Posyandu</th>
                <th className="p-2 text-left">Umur (Bulan)</th>
                <th className="p-2 text-left">Status Gizi</th>
                <th className="p-2 text-left">Status Tikar</th>
                <th className="p-2 text-left">Imunisasi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="p-2">{row.posyanduId}</td>
                  <td className="p-2">{row.umurBulan}</td>
                  <td className="p-2">
                    {row.statusGizi === 1
                      ? "Normal"
                      : row.statusGizi === 2
                        ? "Kurang"
                        : row.statusGizi === 3
                          ? "Buruk"
                          : "Stunting"}
                  </td>
                  <td className="p-2">
                    {row.statusTikar === 2
                      ? "Merah"
                      : row.statusTikar === 3
                        ? "Kuning"
                        : row.statusTikar === 4
                          ? "Hijau"
                          : "-"}
                  </td>
                  <td className="p-2">{row.pemberianImunisasiDasar ? "Ya" : "Tidak"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-muted-foreground" colSpan={5}>
                    Belum ada data pemantauan anak.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <a
          href="/desa/kesehatan/pemantauan-anak/ekspor"
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Ekspor CSV
        </a>
      </div>
    </div>
  );
}
