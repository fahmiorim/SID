import { HardHat } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getPembangunanPublikBySlug } from "@/features/pembangunan/application/use-cases";
import { formatAnggaran, statusPembangunanLabel } from "@/features/pembangunan/domain/pembangunan";
import { formatTanggal, urlMedia } from "@/features/publik/domain/format";
import { PrintButton } from "@/features/surat/presentation/components/print-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { proyek } = await getPembangunanPublikBySlug(slug);
    return { title: proyek.judul, description: proyek.deskripsi ?? undefined };
  } catch {
    return { title: "Proyek Pembangunan" };
  }
}

export default async function PembangunanDetailPublikPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { proyek, dokumentasi } = await getPembangunanPublikBySlug(slug);

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Link href="/desa/pembangunan" className="text-sm text-muted-foreground hover:underline">
            ← Daftar proyek
          </Link>
          <h1 className="text-2xl font-bold">{proyek.judul}</h1>
          <p className="text-sm text-muted-foreground">
            {proyek.tahunAnggaran} · {statusPembangunanLabel(proyek.status)}
          </p>
        </div>
        <div className="print:hidden">
          <PrintButton />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progres fisik</span>
          <span className="font-medium tabular-nums">{proyek.progres}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, proyek.progres))}%` }}
          />
        </div>
      </div>

      <dl className="grid gap-3 rounded-lg border p-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Sumber dana</dt>
          <dd className="text-sm">{proyek.sumberDana ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Anggaran</dt>
          <dd className="text-sm tabular-nums">{formatAnggaran(proyek.anggaran)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Volume</dt>
          <dd className="text-sm">
            {proyek.volume
              ? `${Number(proyek.volume).toLocaleString("id-ID")} ${proyek.satuan ?? ""}`.trim()
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Pelaksana</dt>
          <dd className="text-sm">{proyek.pelaksana ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Lokasi</dt>
          <dd className="text-sm">{proyek.lokasi ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Periode</dt>
          <dd className="text-sm">
            {formatTanggal(proyek.mulai) || "…"} — {formatTanggal(proyek.selesai) || "…"}
          </dd>
        </div>
      </dl>

      {proyek.deskripsi ? (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Deskripsi</h2>
          <p className="text-sm whitespace-pre-line text-muted-foreground">{proyek.deskripsi}</p>
        </section>
      ) : null}

      {proyek.hasil ? (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Hasil / Manfaat</h2>
          <p className="text-sm whitespace-pre-line text-muted-foreground">{proyek.hasil}</p>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Dokumentasi</h2>
        {dokumentasi.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border py-10 text-center text-muted-foreground">
            <HardHat className="size-6" />
            <p className="text-sm">Belum ada foto dokumentasi.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {dokumentasi.map((dok) => (
              <figure key={dok.id} className="overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal */}
                <img
                  src={urlMedia(dok.gambar) ?? ""}
                  alt={dok.judul ?? "Dokumentasi proyek"}
                  className="h-48 w-full object-cover"
                />
                <figcaption className="space-y-1 p-3">
                  <p className="text-sm font-medium">{dok.judul ?? "Foto proyek"}</p>
                  {dok.keterangan ? (
                    <p className="text-xs text-muted-foreground">{dok.keterangan}</p>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
