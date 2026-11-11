import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import {
  detailSuplemenPublik,
  labelSasaranPublik,
} from "@/features/penduduk/application/suplemen-publik-use-cases";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

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
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm">
        <Link
          href="/desa/suplemen"
          className="text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
        >
          ← Semua suplemen
        </Link>
      </nav>

      <ThemePageHeader
        title={detail.nama}
        description={`Sasaran: ${labelSasaranPublik(detail.sasaran)} · ${detail.jumlahTerdata.toLocaleString(
          "id-ID",
        )} data terhimpun`}
      />

      {detail.keterangan ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{detail.keterangan}</p>
      ) : null}

      <ThemeCard className="p-4">
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
      </ThemeCard>

      <p className="text-xs text-muted-foreground">
        Data pribadi warga tidak ditampilkan pada halaman publik. Hubungi kantor desa untuk
        keterangan lebih lanjut.
      </p>
    </div>
  );
}
