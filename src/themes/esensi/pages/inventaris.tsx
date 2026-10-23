import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { formatJumlah } from "@/features/publik/domain/ringkasan-publik";
import type { InventarisProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader, ThemeStatGrid } from "@/themes/ui";

const KONDISI_LABELS: Record<string, string> = {
  baik: "Baik",
  rusak_ringan: "Rusak ringan",
  rusak_berat: "Rusak berat",
};

/** Transparansi aset dan inventaris desa. */
export function EsensiInventaris({ ctx, rekap, inventaris }: InventarisProps) {
  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Inventaris & Aset Desa"
        description={`Ringkasan aset yang tercatat pada ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      <ThemeStatGrid
        items={[
          { label: "Jenis Barang", nilai: rekap.jumlahBarang },
          { label: "Total Unit", nilai: formatJumlah(rekap.totalUnit) },
          { label: "Nilai Aset", nilai: formatRupiah(rekap.totalNilai) },
          {
            label: "Kategori",
            nilai: rekap.perKategori.length,
          },
        ]}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Rekap per Kategori</h2>
        {rekap.perKategori.length === 0 ? (
          <ThemeEmpty>Data inventaris belum tersedia.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 text-right font-medium">Jenis</th>
                  <th className="px-4 py-3 text-right font-medium">Unit</th>
                  <th className="px-4 py-3 text-right font-medium">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {rekap.perKategori.map((row) => (
                  <tr key={row.nama} className="border-t">
                    <td className="px-4 py-3">{row.nama}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.jumlah}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatJumlah(row.unit)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(row.nilai)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ThemeCard>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Daftar Barang</h2>
        {inventaris.length === 0 ? (
          <ThemeEmpty>Belum ada barang inventaris yang tercatat.</ThemeEmpty>
        ) : (
          <ThemeCard>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama Barang</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                    <th className="px-4 py-3 font-medium">Kondisi</th>
                    <th className="px-4 py-3 font-medium">Lokasi</th>
                    <th className="px-4 py-3 text-right font-medium">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {inventaris.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{item.nama}</td>
                      <td className="px-4 py-3">{item.kategori ?? "-"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatJumlah(item.jumlah)} {item.satuan ?? ""}
                      </td>
                      <td className="px-4 py-3">{KONDISI_LABELS[item.kondisi] ?? item.kondisi}</td>
                      <td className="px-4 py-3">{item.lokasi ?? "-"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {item.nilai ? formatRupiah(item.nilai) : "-"}
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
