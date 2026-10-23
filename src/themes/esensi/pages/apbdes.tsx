import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import type { ApbdesProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Transparansi APBDes: ringkasan + realisasi per bidang. */
export function EsensiApbdes({ ctx, laporan }: ApbdesProps) {
  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Transparansi APBDes"
        description={`Ringkasan Anggaran Pendapatan dan Belanja Desa ${ctx.desa.namaDesa ?? "desa"} tahun ${laporan.tahun}.`}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Ringkasan Anggaran</h2>
        {laporan.baris.length === 0 ? (
          <ThemeEmpty>Data anggaran tahun ini belum tersedia.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Realisasi Belanja per Bidang</h2>
        {laporan.bidang.length === 0 ? (
          <ThemeEmpty>Data realisasi per bidang belum tersedia.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <div className="overflow-x-auto">
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
                        {row.persen.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ThemeCard>
        )}
      </section>
    </div>
  );
}
