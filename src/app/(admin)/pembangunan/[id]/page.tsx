import { ArrowLeft, HardHat } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPembangunanDetail } from "@/features/pembangunan/application/use-cases";
import {
  formatAnggaran,
  PEMBANGUNAN_RESOURCE,
  statusPembangunanLabel,
} from "@/features/pembangunan/domain/pembangunan";
import { DokumentasiDeleteButton } from "@/features/pembangunan/presentation/components/dokumentasi-delete-button";
import { DokumentasiUploadButton } from "@/features/pembangunan/presentation/components/dokumentasi-upload-button";
import { formatTanggal, urlMedia } from "@/features/publik/domain/format";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Rincian Proyek Pembangunan",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function formatPeriode(mulai: string | null, selesai: string | null): string {
  if (!mulai && !selesai) return "-";
  return `${mulai ? formatTanggal(mulai) : "…"} — ${selesai ? formatTanggal(selesai) : "…"}`;
}

export default async function PembangunanDetailPage({ params }: PageProps<"/pembangunan/[id]">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PEMBANGUNAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Pembangunan Desa"
        description="Rencana, realisasi, dan hasil proyek pembangunan desa."
      />
    );
  }

  const { id } = await params;
  const proyekId = Number(id);
  if (!Number.isInteger(proyekId) || proyekId <= 0) {
    return <div className="p-6">ID proyek tidak valid.</div>;
  }

  const { proyek, dokumentasi, canManage } = await getPembangunanDetail(proyekId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/pembangunan">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">{proyek.judul}</h1>
          <p className="text-sm text-muted-foreground">
            {proyek.tahunAnggaran} · {statusPembangunanLabel(proyek.status)}
          </p>
        </div>
        {canManage ? <DokumentasiUploadButton proyekId={proyek.id} /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Proyek</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3">
            <DetailRow label="Sumber Dana" value={proyek.sumberDana ?? "-"} />
            <DetailRow label="Anggaran" value={formatAnggaran(proyek.anggaran)} />
            <DetailRow
              label="Volume"
              value={
                proyek.volume
                  ? `${Number(proyek.volume).toLocaleString("id-ID")} ${proyek.satuan ?? ""}`.trim()
                  : "-"
              }
            />
            <DetailRow label="Pelaksana" value={proyek.pelaksana ?? "-"} />
            <DetailRow label="Lokasi" value={proyek.lokasi ?? "-"} />
            <DetailRow label="Periode" value={formatPeriode(proyek.mulai, proyek.selesai)} />
            <DetailRow label="Status" value={statusPembangunanLabel(proyek.status)} />
            <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
              <dt className="text-sm text-muted-foreground">Progres Fisik</dt>
              <dd className="flex items-center gap-2">
                <div className="h-2 w-40 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.max(0, proyek.progres))}%` }}
                  />
                </div>
                <span className="text-sm tabular-nums">{proyek.progres}%</span>
              </dd>
            </div>
            {proyek.deskripsi ? <DetailRow label="Deskripsi" value={proyek.deskripsi} /> : null}
            {proyek.hasil ? <DetailRow label="Hasil / Manfaat" value={proyek.hasil} /> : null}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dokumentasi</CardTitle>
        </CardHeader>
        <CardContent>
          {dokumentasi.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <HardHat className="size-5" />
              <p className="text-sm">Belum ada foto dokumentasi.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dokumentasi.map((dok) => (
                <figure key={dok.id} className="overflow-hidden rounded-lg border">
                  <div className="relative bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- media dinamis dari penyimpanan lokal */}
                    <img
                      src={urlMedia(dok.gambar) ?? ""}
                      alt={dok.judul ?? "Dokumentasi proyek"}
                      className="h-40 w-full object-cover"
                    />
                    {canManage ? (
                      <div className="absolute top-2 right-2">
                        <DokumentasiDeleteButton id={dok.id} />
                      </div>
                    ) : null}
                  </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
