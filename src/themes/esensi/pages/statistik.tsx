import { Download } from "lucide-react";

import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import type { StatistikProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader, ThemeStatGrid } from "@/themes/ui";

/** Statistik kependudukan, bantuan, dan ringkasan keuangan desa. */
export function EsensiStatistik({ ctx, statistik, periode }: StatistikProps) {
  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Statistik Desa"
        description={`Data kependudukan dan ringkasan program ${ctx.desa.namaDesa ?? "desa"} yang bersumber dari basis data desa.`}
      />

      {/* OS-WEB-006: unduhan mengikuti tenant host, bukan input pengguna. */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="/desa/statistik/ekspor"
          className="tema-link-primary inline-flex min-h-10 items-center gap-2 border px-4 text-sm font-medium hover:underline"
        >
          <Download className="size-4" aria-hidden="true" />
          Unduh CSV
        </a>
        <p className="text-xs text-muted-foreground">
          Ringkasan yang sama dengan tabel di bawah, tanpa data pribadi penduduk.
        </p>
      </div>

      <ThemeStatGrid
        items={[
          { label: "Total Penduduk", nilai: statistik.total },
          { label: "Laki-laki", nilai: statistik.lakiLaki },
          { label: "Perempuan", nilai: statistik.perempuan },
          { label: "Kartu Keluarga", nilai: statistik.keluarga },
        ]}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Bantuan & Keuangan</h2>
        <ThemeStatGrid
          items={[
            { label: "Program Bantuan", nilai: statistik.bantuan.program },
            { label: "Peserta Bantuan", nilai: statistik.bantuan.peserta },
            {
              label: `Pendapatan ${statistik.keuangan.tahun}`,
              nilai: formatRupiah(statistik.keuangan.pendapatan),
            },
            { label: "Belanja", nilai: formatRupiah(statistik.keuangan.belanja) },
          ]}
        />
        <ThemeCard className="p-5 text-sm text-muted-foreground">
          Realisasi belanja tahun {statistik.keuangan.tahun}:{" "}
          <span className="font-medium text-foreground">
            {formatRupiah(statistik.keuangan.realisasiBelanja)}
          </span>
          . Rincian ada di halaman{" "}
          <a className="underline underline-offset-4" href="/desa/apbdes">
            APBDes
          </a>
          .
        </ThemeCard>
      </section>

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
      {/* OS-WEB-006: Periodisasi Triwulan */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Realisasi APBDes Per Triwulan</h2>
        {periode.length === 0 ? (
          <ThemeCard className="p-5 text-sm text-muted-foreground">
            Data realisasi triwulan belum tersedia.
          </ThemeCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {periode.map((p) => (
              <ThemeCard key={p.triwulan} className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{p.label}</p>
                <p className="mt-1 text-lg font-bold tabular-nums">{formatRupiah(p.realisasi)}</p>
                <p className="text-xs text-muted-foreground">{p.persen.toFixed(1)}%</p>
              </ThemeCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
