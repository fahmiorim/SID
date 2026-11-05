import { INVENTARIS_KONDISI_LABELS } from "@/features/inventaris/domain/inventaris";
import {
  filterInventarisAktif,
  type InventarisFilter,
  type OpsiInventarisPublik,
} from "@/features/inventaris/domain/inventaris-publik";
import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { formatJumlah } from "@/features/publik/domain/ringkasan-publik";
import type { InventarisProps } from "@/themes/types";
import { ThemeButton, ThemeCard, ThemeEmpty, ThemePageHeader, ThemeStatGrid } from "@/themes/ui";

const KONDISI_LABELS: Record<string, string> = {
  baik: "Baik",
  rusak_ringan: "Rusak ringan",
  rusak_berat: "Rusak berat",
};

const selectClass = "min-h-10 w-full border bg-card px-2 text-sm";

function FilterInventaris({
  filter,
  opsi,
}: {
  filter: InventarisFilter;
  opsi: OpsiInventarisPublik;
}) {
  return (
    <form
      method="get"
      action="/desa/inventaris"
      className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end print:hidden"
      aria-label="Filter inventaris"
    >
      <div className="space-y-1">
        <label htmlFor="filter-kategori" className="text-xs font-medium text-muted-foreground">
          Kategori
        </label>
        <select
          id="filter-kategori"
          name="kategori"
          defaultValue={filter.kategoriId ?? ""}
          className={selectClass}
        >
          <option value="">Semua kategori</option>
          {opsi.kategori.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-kondisi" className="text-xs font-medium text-muted-foreground">
          Kondisi
        </label>
        <select
          id="filter-kondisi"
          name="kondisi"
          defaultValue={filter.kondisi ?? ""}
          className={selectClass}
        >
          <option value="">Semua kondisi</option>
          {Object.entries(INVENTARIS_KONDISI_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-lokasi" className="text-xs font-medium text-muted-foreground">
          Lokasi
        </label>
        <select
          id="filter-lokasi"
          name="lokasi"
          defaultValue={filter.lokasi ?? ""}
          className={selectClass}
        >
          <option value="">Semua lokasi</option>
          {opsi.lokasi.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-tahun" className="text-xs font-medium text-muted-foreground">
          Tahun
        </label>
        <select
          id="filter-tahun"
          name="tahun"
          defaultValue={filter.tahun ?? ""}
          className={selectClass}
        >
          <option value="">Semua tahun</option>
          {opsi.tahun.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="tema-button-primary inline-flex min-h-10 items-center gap-2 px-4 text-sm font-medium"
        >
          Terapkan
        </button>
        {filterInventarisAktif(filter) ? (
          <a href="/desa/inventaris" className="text-sm underline-offset-4 hover:underline">
            Reset
          </a>
        ) : null}
      </div>
    </form>
  );
}

/** Transparansi aset dan inventaris desa. */
export function EsensiInventaris({
  ctx,
  rekap,
  inventaris,
  filter,
  opsi,
  eksporHref,
}: InventarisProps) {
  const filterAktif = filterInventarisAktif(filter);

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Inventaris & Aset Desa"
        description={`Ringkasan aset yang tercatat pada ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      <FilterInventaris filter={filter} opsi={opsi} />

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

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted-foreground">
          {filterAktif
            ? `Menampilkan ${rekap.jumlahBarang.toLocaleString("id-ID")} barang sesuai filter.`
            : "Seluruh aset desa yang tercatat."}
        </p>
        <ThemeButton href={eksporHref} variant="outline">
          Unduh CSV
        </ThemeButton>
      </div>

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
          <ThemeEmpty>
            {filterAktif
              ? "Tidak ada aset yang cocok dengan filter tersebut."
              : "Belum ada barang inventaris yang tercatat."}
          </ThemeEmpty>
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
