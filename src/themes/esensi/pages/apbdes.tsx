import Link from "next/link";

import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import type { ApbdesProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Transparansi APBDes: ringkasan + realisasi per bidang. */
export function EsensiApbdes({ ctx, laporan, dokumen }: ApbdesProps) {
  const totalAnggaran = Number(laporan.total.anggaran);
  const totalRealisasi = Number(laporan.total.realisasi);
  const serapan = totalAnggaran > 0 ? Math.min(100, (totalRealisasi / totalAnggaran) * 100) : 0;
  // `baris` dan `bidang` selalu berisi template rekening, jadi angka nol belum
  // tentu berarti desa benar-benar menganggarkan Rp 0.
  const tanpaAnggaran = totalAnggaran === 0 && totalRealisasi === 0;

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Transparansi APBDes"
        description={`Ringkasan Anggaran Pendapatan dan Belanja Desa ${ctx.desa.namaDesa ?? "desa"} tahun ${laporan.tahun}.`}
      />
      {laporan.tersedia.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          {[...laporan.tersedia].reverse().map((tahun) => (
            <Link
              key={tahun}
              href={`/desa/apbdes?tahun=${tahun}`}
              className={`rounded-full px-3 py-1 text-sm ${tahun === laporan.tahun ? "" : "border"}`}
              style={
                tahun === laporan.tahun
                  ? {
                      backgroundColor: "var(--pub-primary)",
                      color: "var(--pub-primary-foreground)",
                    }
                  : undefined
              }
            >
              {tahun}
            </Link>
          ))}
        </div>
      ) : null}

      {dokumen.length > 0 ? (
        <section className="space-y-4" aria-labelledby="dokumen-laporan">
          <h2 id="dokumen-laporan" className="text-xl font-semibold tracking-tight">
            Dokumen Laporan
          </h2>
          <p className="text-sm text-muted-foreground">
            Dokumen APBDes yang sudah diserahkan dan dapat diunduh sebagai PDF.
          </p>
          <ThemeCard>
            <ul className="divide-y">
              {dokumen.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/desa/apbdes/dokumen/${item.id}/berkas`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/50"
                  >
                    <span>
                      <span className="block font-medium">{item.judul}</span>
                      <span className="block text-xs text-muted-foreground">
                        {item.semesterLabel} {item.tahun}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold tracking-wide uppercase">
                      PDF
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </ThemeCard>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Ringkasan Anggaran</h2>
        {tanpaAnggaran ? (
          <ThemeEmpty>Data anggaran tahun {laporan.tahun} belum tersedia.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <ul className="divide-y sm:hidden">
              {laporan.baris.map((row) => (
                <li key={row.kode} className="px-4 py-3.5">
                  <p className="font-medium">{row.uraian}</p>
                  <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Anggaran</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {formatRupiah(row.anggaran)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Realisasi</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {formatRupiah(row.realisasi)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Selisih</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {formatRupiah(row.selisih)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
              <li className="bg-muted/30 px-4 py-3.5">
                <p className="font-semibold">Total</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Anggaran</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">
                      {formatRupiah(laporan.total.anggaran)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Realisasi</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">
                      {formatRupiah(laporan.total.realisasi)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Selisih</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">
                      {formatRupiah(laporan.total.selisih)}
                    </dd>
                  </div>
                </dl>
              </li>
            </ul>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Uraian</th>
                    <th className="px-4 py-3 text-right font-medium">Anggaran</th>
                    <th className="px-4 py-3 text-right font-medium">Realisasi</th>
                    <th className="px-4 py-3 text-right font-medium">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.baris.map((row) => (
                    <tr key={row.kode} className="border-t">
                      <td className="px-4 py-3 font-medium">{row.uraian}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatRupiah(row.anggaran)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatRupiah(row.realisasi)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatRupiah(row.selisih)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td className="px-4 py-3 font-semibold">Total</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(laporan.total.anggaran)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(laporan.total.realisasi)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(laporan.total.selisih)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ThemeCard>
        )}
      </section>

      {!tanpaAnggaran ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Serapan Anggaran</h2>
          <ThemeCard className="p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {formatRupiah(laporan.total.realisasi)} dari {formatRupiah(laporan.total.anggaran)}
              </p>
              <p className="text-lg font-bold tabular-nums">
                {serapan.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${serapan}%`,
                  backgroundColor: "var(--pub-primary)",
                }}
              />
            </div>
          </ThemeCard>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Realisasi Belanja per Bidang</h2>
        {tanpaAnggaran ? (
          <ThemeEmpty>Data realisasi per bidang tahun {laporan.tahun} belum tersedia.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <ul className="divide-y sm:hidden">
              {laporan.bidang.map((row) => (
                <li key={row.kode} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{row.uraian}</p>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {row.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%
                    </span>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Anggaran</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {formatRupiah(row.anggaran)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Realisasi</dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {formatRupiah(row.realisasi)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Bidang</th>
                    <th className="px-4 py-3 text-right font-medium">Anggaran</th>
                    <th className="px-4 py-3 text-right font-medium">Realisasi</th>
                    <th className="px-4 py-3 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.bidang.map((row) => (
                    <tr key={row.kode} className="border-t">
                      <td className="px-4 py-3 font-medium">{row.uraian}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatRupiah(row.anggaran)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatRupiah(row.realisasi)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="inline-flex items-center justify-end gap-2">
                          <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, row.persen))}%`,
                                backgroundColor: "var(--pub-primary)",
                              }}
                            />
                          </span>
                          {row.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ThemeCard>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Realisasi per Periode (Triwulan)</h2>
        <p className="text-sm text-muted-foreground">
          Serapan anggaran tahun {laporan.tahun} per triwulan.
        </p>
        {laporan.periode.every((row) => Number(row.realisasi) === 0) ? (
          <ThemeEmpty>Data realisasi per triwulan belum tersedia.</ThemeEmpty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {laporan.periode.map((row) => (
              <ThemeCard key={row.triwulan} className="space-y-1 p-4">
                <p className="text-sm font-medium text-muted-foreground">{row.label}</p>
                <p className="text-lg font-semibold tabular-nums">{formatRupiah(row.realisasi)}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {row.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}% dari anggaran
                </p>
              </ThemeCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
