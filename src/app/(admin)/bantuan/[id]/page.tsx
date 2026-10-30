import { Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBantuanDetail } from "@/features/bantuan/application/use-cases";
import {
  asalDanaLabel,
  BANTUAN_RESOURCE,
  sasaranLabel,
  STATUS_MASA_AKTIF_LABELS,
  statusMasaAktif,
} from "@/features/bantuan/domain/bantuan";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Detail Program Bantuan",
};

function formatPeriode(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "Tanpa batas";
  return `${startDate ?? "…"} — ${endDate ?? "…"}`;
}

function statusVariant(status: string | null | undefined): "default" | "outline" | "secondary" {
  if (status === "aktif") return "default";
  if (status === "selesai") return "outline";
  return "secondary";
}

export default async function BantuanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, BANTUAN_RESOURCE, "read")) {
    return <NoAccess title="Bantuan Sosial" description="Program dan peserta bantuan desa." />;
  }

  const { id } = await params;
  const programId = Number(id);
  if (!Number.isFinite(programId) || programId <= 0) {
    return <div className="p-6">ID program tidak valid.</div>;
  }

  const detail = await getBantuanDetail(programId);
  const { program, peserta, sebaranWilayah, canManage } = detail;

  const masaAktif = statusMasaAktif(program.startDate, program.endDate);
  const statusVariantValue = masaAktif ? statusVariant(masaAktif) : "secondary";

  return (
    <div className="space-y-6">
      <PageHeader
        title={program.name}
        description={`Program bantuan desa | ${sasaranLabel(program.sasaran)} | ${asalDanaLabel(program.asalDana)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Cetak
            </Button>
            {canManage ? (
              <Button asChild variant="outline">
                <Link href="/bantuan">Kembali daftar program</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Program Info Card */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nama Program</p>
            <p className="font-medium">{program.name}</p>
            {program.slug && (
              <p className="mt-1 text-xs text-muted-foreground">
                Slug: <code className="rounded bg-muted px-1">{program.slug}</code>
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sasaran</p>
            <p className="font-medium">{sasaranLabel(program.sasaran)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Masa Aktif</p>
            <p className="font-medium">{formatPeriode(program.startDate, program.endDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Asal Dana</p>
            <p className="font-medium">{asalDanaLabel(program.asalDana)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Status Badge */}
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Status Masa Aktif</p>
          <Badge variant={statusVariantValue} className="text-xs">
            {STATUS_MASA_AKTIF_LABELS[masaAktif as keyof typeof STATUS_MASA_AKTIF_LABELS] || "-"}
          </Badge>
        </CardContent>
      </Card>

      {/* Peserta Section */}
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Jumlah Peserta</p>
          <p className="mt-1 font-medium">{peserta.length}</p>
          {canManage && peserta.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {peserta.length} {peserta.length === 1 ? "peserta" : "peserta"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Peserta List */}
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Daftar Peserta</p>
          {peserta.length === 0 ? (
            <p className="h-28 text-center text-muted-foreground">Tidak ada peserta terdaftar</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {program.sasaran === 2 ? (
                    <TableHead>No KK</TableHead>
                  ) : program.sasaran === 3 ? (
                    <TableHead>No RTM</TableHead>
                  ) : program.sasaran === 4 ? (
                    <TableHead>Kelompok</TableHead>
                  ) : (
                    <TableHead>NIK</TableHead>
                  )}
                  <TableHead>Nama Sasaran</TableHead>
                  <TableHead>Identitas</TableHead>
                  <TableHead>No Kartu</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {peserta.map((p) => {
                  const identity = p.targetIdentity ?? "-";
                  const cardNum = p.cardNumber ?? "-";
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>{p.targetIdentity ?? "-"}</div>
                      </TableCell>
                      <TableCell>{p.targetName}</TableCell>
                      <TableCell>{identity}</TableCell>
                      <TableCell>{cardNum}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sebaran Wilayah */}
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sebaran Wilayah</p>
          {sebaranWilayah.length === 0 ? (
            <p className="h-28 text-center text-muted-foreground">Wilayah belum diisi</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wilayah</TableHead>
                  <TableHead>Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sebaranWilayah.map((s) => (
                  <TableRow key={s.label} className="hover:bg-muted/50">
                    <TableCell>{s.label}</TableCell>
                    <TableCell className="tabular-nums">{s.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      {canManage && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Ekspor</p>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/bantuan/ekspor?programId=${program.id}`}
                className="rounded-md border px-3 py-2 text-sm"
              >
                CSV
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
