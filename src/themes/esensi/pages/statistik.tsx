import type { StatistikProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader, ThemeStatGrid } from "@/themes/ui";

/** Statistik kependudukan desa. */
export function EsensiStatistik({ ctx, statistik }: StatistikProps) {
  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Statistik Desa"
        description={`Data kependudukan ${ctx.desa.namaDesa ?? "desa"} yang bersumber dari basis data desa.`}
      />

      <ThemeStatGrid
        items={[
          { label: "Total Penduduk", nilai: statistik.total },
          { label: "Laki-laki", nilai: statistik.lakiLaki },
          { label: "Perempuan", nilai: statistik.perempuan },
          { label: "Kartu Keluarga", nilai: statistik.keluarga },
        ]}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Sebaran per Dusun</h2>
        {statistik.perDusun.length === 0 ? (
          <ThemeEmpty>Data wilayah belum tersedia.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Dusun</th>
                  <th className="px-4 py-3 text-right font-medium">Jumlah Penduduk</th>
                </tr>
              </thead>
              <tbody>
                {statistik.perDusun.map((row) => (
                  <tr key={row.label} className="border-t">
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ThemeCard>
        )}
      </section>
    </div>
  );
}
