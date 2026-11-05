import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import {
  detailSuplemenPublik,
  labelSasaranPublik,
} from "@/features/penduduk/application/suplemen-publik-use-cases";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/desa/suplemen/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const desa = await getIdentitasFromRequest();
  const detail = await detailSuplemenPublik(desa.id, slug);

  return {
    title: detail ? `${detail.nama} · ${desa.namaDesa ?? "Desa"}` : "Suplemen tidak ditemukan",
  };
}

export default async function SuplemenDetailPage({ params }: PageProps<"/desa/suplemen/[slug]">) {
  const { slug } = await params;
  const desa = await getIdentitasFromRequest();
  const detail = await detailSuplemenPublik(desa.id, slug);

  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <nav className="text-sm">
        <Link href="/desa/suplemen" className="text-primary underline-offset-4 hover:underline">
          ← Semua suplemen
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{detail.nama}</h1>
        <p className="text-sm text-muted-foreground">
          Sasaran: {labelSasaranPublik(detail.sasaran)} · {detail.jumlahTerdata} data terhimpun
        </p>
        {detail.keterangan ? <p className="text-sm">{detail.keterangan}</p> : null}
      </header>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">Kolom data</h2>
        {detail.kolomIsian.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Belum ada isian yang tercatat.</p>
        ) : (
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            {detail.kolomIsian.map((kolom) => (
              <li key={kolom}>{kolom}</li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Data pribadi warga tidak ditampilkan pada halaman publik. Hubungi kantor desa untuk
        keterangan lebih lanjut.
      </p>
    </div>
  );
}
