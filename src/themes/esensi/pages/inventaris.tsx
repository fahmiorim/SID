import { Download, Search } from "lucide-react";

import {
  INVENTARIS_KONDISI,
  INVENTARIS_KONDISI_LABELS,
  type InventarisKondisi,
} from "@/features/inventaris/domain/inventaris";
import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { filterInventarisAktif } from "@/features/publik/domain/inventaris-publik";
import { formatJumlah } from "@/features/publik/domain/ringkasan-publik";
import type { InventarisProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader, ThemeStatGrid } from "@/themes/ui";

/** Transparansi aset dan inventaris desa. */
export function EsensiInventaris({
  ctx,
  rekap,
  inventaris,
  filter,
  opsi,
  eksporUrl,
}: InventarisProps) {
  const filterAktif = filterInventarisAktif(filter);

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Inventaris & Aset Desa"
        description={`Ringkasan aset yang tercatat pada ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      <section className="space-y-3" aria-label="Filter inventaris">
        <form
          method="get"
          action="/desa/inventaris"
          className="grid gap-3 border p-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{ borderRadius: "var(--pub-radius)" }}
        >
          <label className="sr-only" htmlFor="inventaris-q">
            Cari barang
          </label>
          <input
            id="inventaris-q"
            type="search"
            name="q"
            maxLength={100}
            defaultValue={filter.cari}
            placeholder="Cari nama atau kode barang"
            className="min-h-10 border px-3 text-sm"
          />

          <label className="sr-only" htmlFor="inventaris-kategori">
            Kategori
          </label>
          <select
            id="inventaris-kategori"
            name="kategori"
            defaultValue={filter.kategori}
            className="min-h-10 border px-3 text-sm"
          >
            <option value="">Semua kategori</option>
            {opsi.kategori.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="inventaris-kondisi">
            Kondisi
          </label>
          <select
            id="inventaris-kondisi"
            name="kondisi"
            defaultValue={filter.kondisi}
            className="min-h-10 border px-3 text-sm"
          >
            <option value="">Semua kondisi</option>
            {INVENTARIS_KONDISI.map((item) => (
              <option key={item} value={item}>
                {INVENTARIS_KONDISI_LABELS[item]}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="inventaris-lokasi">
            Lokasi
          </label>
          <select
            id="inventaris-lokasi"
            name="lokasi"
            defaultValue={filter.lokasi}
            className="min-h-10 border px-3 text-sm"
          >
            <option value="">Semua lokasi</option>
            {opsi.lokasi.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="inventaris-tahun">
            Tahun pembelian
          </label>
          <select
            id="inventaris-tahun"
            name="tahun"
            defaultValue={filter.tahun === null ? "" : String(filter.tahun)}
            className="min-h-10 border px-3 text-sm"
          >
            <option value="">Semua tahun</option>
            {opsi.tahun.map((item) => (
              <option key={item} value={String(item)}>
                {item}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="tema-button-primary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-medium"
            >
              <Search className="size-4" />
              Terapkan
            </button>
            <a
              href={eksporUrl}
              className="tema-link-primary inline-flex min-h-10 items-center gap-2 border px-4 text-sm font-medium hover:underline"
            >
              <Download className="size-4" />
              Unduh CSV
            </a>
          </div>
        </form>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filterAktif
            ? `${inventaris.length} barang cocok dengan filter.`
            : `${inventaris.length} jenis barang tercatat.`}
        </p>
      </section>

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
          <ThemeEmpty>
            {filterAktif
              ? "Tidak ada barang yang cocok dengan filter."
              : "Data inventaris belum tersedia."}
          </ThemeEmpty>
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
                      <td className="px-4 py-3">
                        {INVENTARIS_KONDISI_LABELS[item.kondisi as InventarisKondisi] ??
                          item.kondisi}
                      </td>
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
