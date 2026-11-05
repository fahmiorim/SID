import type { Metadata } from "next";
import Link from "next/link";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import {
  daftarSuplemenPublik,
  labelSasaranPublik,
} from "@/features/penduduk/application/suplemen-publik-use-cases";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const desa = await getIdentitasFromRequest();
  return {
    title: `Suplemen Data · ${desa.namaDesa ?? "Desa"}`,
    description: `Data suplemen dan kelompok sasaran yang dihimpun desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function SuplemenPublikPage() {
  const desa = await getIdentitasFromRequest();
  const rows = await daftarSuplemenPublik(desa.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Suplemen Data Desa</h1>
        <p className="text-sm text-muted-foreground">
          Kumpulan data tambahan yang dihimpun Desa {desa.namaDesa ?? ""} beserta jumlah data
          terhimpun. Halaman ini hanya menampilkan ringkasan, bukan data pribadi warga.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          Belum ada suplemen data yang dipublikasikan.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border p-4">
              <h2 className="font-semibold">{row.nama}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sasaran: {labelSasaranPublik(row.sasaran)} · {row.jumlahTerdata} data
              </p>
              {row.keterangan ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{row.keterangan}</p>
              ) : null}
              <Link
                href={`/desa/suplemen/${row.slug}`}
                className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
              >
                Lihat ringkasan
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
