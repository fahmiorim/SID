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
            <ul className="divide-y md:hidden">
              {baris.map((row) => (
                <li key={row.kode} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 leading-snug font-medium">{row.uraian}</p>
                    <span className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums">
                      {row.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Anggaran</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {formatRupiah(row.anggaran)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">TW I</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">{formatRupiah(row.tw1)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">TW II</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">{formatRupiah(row.tw2)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">TW III</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">{formatRupiah(row.tw3)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">TW IV</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">{formatRupiah(row.tw4)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Realisasi</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {formatRupiah(row.realisasi)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="flex justify-end border-t bg-muted/30 px-4 py-4 md:hidden">
              <div className="grid w-full grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Anggaran</p>
                  <p className="font-semibold tabular-nums">{formatRupiah(total.anggaran)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Realisasi</p>
                  <p className="font-semibold tabular-nums">{formatRupiah(total.realisasi)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Serapan</p>
                  <p className="font-semibold tabular-nums">
                    {total.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden overflow-x-auto md:block">
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
