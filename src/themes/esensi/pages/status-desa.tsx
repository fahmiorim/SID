import { formatRupiah } from "@/features/keuangan/domain/keuangan";
import { formatJumlah } from "@/features/publik/domain/ringkasan-publik";
import type { StatusDesaProps } from "@/themes/types";
import { ThemeCard, ThemePageHeader, ThemeStatGrid } from "@/themes/ui";

const KONDISI_LABELS: Record<string, string> = {
  baik: "Baik",
  rusak_ringan: "Rusak ringan",
  rusak_berat: "Rusak berat",
};

/** Identitas dan status aset desa dalam satu halaman. */
export function EsensiStatusDesa({ ctx, desa, inventaris }: StatusDesaProps) {
  const identitas = [
    { label: "Nama Desa", value: desa.namaDesa },
    { label: "Kode Desa", value: desa.kodeDesa },
    { label: "Kecamatan", value: desa.namaKecamatan },
    { label: "Kabupaten/Kota", value: desa.namaKabupaten },
    { label: "Provinsi", value: desa.namaPropinsi },
    { label: "Kode Pos", value: desa.kodePos },
    { label: "Alamat Kantor", value: desa.alamatKantor },
    { label: "Kepala Desa", value: desa.namaKepalaDesa },
    { label: "Telepon", value: desa.telepon },
    { label: "Email", value: desa.emailDesa },
    { label: "Website", value: desa.website },
  ].filter((row) => row.value);

  return (
    <div className="space-y-10">
      <ThemePageHeader
        title="Status Desa"
        description={`Identitas dan ringkasan aset ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Identitas Desa</h2>
        <ThemeCard>
          <dl className="divide-y">
            {identitas.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
                <dt className="w-48 shrink-0 text-sm text-muted-foreground">{row.label}</dt>
                <dd className="text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </ThemeCard>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Ringkasan Aset</h2>
        <ThemeStatGrid
          items={[
            { label: "Jenis Barang", nilai: inventaris.jumlahBarang },
            { label: "Total Unit", nilai: formatJumlah(inventaris.totalUnit) },
            { label: "Nilai Aset", nilai: formatRupiah(inventaris.totalNilai) },
            { label: "Kategori", nilai: inventaris.perKategori.length },
          ]}
        />

        {inventaris.perKondisi.length > 0 ? (
          <ThemeCard className="p-5">
            <h3 className="mb-3 text-sm font-medium">Kondisi Barang</h3>
            <ul className="grid gap-2 sm:grid-cols-3">
              {inventaris.perKondisi.map((row) => (
                <li key={row.kondisi} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {KONDISI_LABELS[row.kondisi] ?? row.kondisi}
                  </span>
                  <span className="font-medium tabular-nums">{row.jumlah}</span>
                </li>
              ))}
            </ul>
          </ThemeCard>
        ) : null}
      </section>
    </div>
  );
}
