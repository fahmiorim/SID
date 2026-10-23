import Link from "next/link";

import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import type { TriwulanProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Realisasi APBDes per triwulan + catatan status IDM/SDGs. */
export function EsensiTriwulan({ ctx, tahun, tersedia, baris, total }: TriwulanProps) {
  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Laporan Triwulan & IDM/SDGs"
        description={`Realisasi anggaran ${ctx.desa.namaDesa ?? "desa"} per triwulan tahun ${tahun}.`}
      />

      {tersedia.length > 1 ? (
        <nav aria-label="Pilih tahun anggaran" className="flex flex-wrap gap-2">
          {tersedia.map((item) => (
            <Link
              key={item}
              href={`/desa/idm-sdgs?tahun=${item}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                item === tahun ? "font-semibold" : "text-muted-foreground"
              }`}
              style={
                item === tahun
                  ? {
                      backgroundColor: "var(--pub-primary)",
                      borderColor: "var(--pub-primary)",
                      color: "var(--pub-primary-foreground)",
                    }
                  : undefined
              }
            >
              {item}
            </Link>
          ))}
        </nav>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Realisasi per Bidang</h2>
        {baris.length === 0 ? (
          <ThemeEmpty>Data anggaran dan realisasi triwulan belum tersedia.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Bidang</th>
                    <th className="px-4 py-3 text-right font-medium">Anggaran</th>
                    <th className="px-4 py-3 text-right font-medium">TW I</th>
                    <th className="px-4 py-3 text-right font-medium">TW II</th>
                    <th className="px-4 py-3 text-right font-medium">TW III</th>
                    <th className="px-4 py-3 text-right font-medium">TW IV</th>
                    <th className="px-4 py-3 text-right font-medium">Realisasi</th>
                    <th className="px-4 py-3 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {baris.map((row) => (
                    <tr key={row.kode} className="border-t">
                      <td className="px-4 py-3 font-medium">{row.uraian}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatRupiah(row.anggaran)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(row.tw1)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(row.tw2)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(row.tw3)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(row.tw4)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatRupiah(row.realisasi)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td className="px-4 py-3 font-semibold">Total</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(total.anggaran)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(total.tw1)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(total.tw2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(total.tw3)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(total.tw4)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(total.realisasi)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {total.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ThemeCard>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Indeks Desa Membangun & SDGs</h2>
        <ThemeEmpty>
          Data indikator IDM dan SDGs Desa belum tersedia di sistem ini. Halaman ini hanya
          menampilkan realisasi anggaran per triwulan yang tercatat.
        </ThemeEmpty>
      </section>
    </div>
  );
}
