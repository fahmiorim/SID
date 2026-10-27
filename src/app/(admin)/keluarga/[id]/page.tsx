import { ArrowLeft, FileText, History, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getKeluargaDetail } from "@/features/keluarga/application/use-cases";
import {
  AKSI_LOG_LABELS,
  KELUARGA_RESOURCE,
  keluargaLabel,
} from "@/features/keluarga/domain/keluarga";
import {
  calculateAge,
  GENDER_LABELS,
  LIFE_STATUS_LABELS,
} from "@/features/penduduk/domain/penduduk";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Detail Kartu Keluarga",
};

/** Format waktu riwayat dalam bahasa Indonesia. */
function formatWaktu(iso: string): string {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return "-";
  return tanggal.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

/** Warna lencana jenis perubahan anggota. */
function aksiVariant(aksi: keyof typeof AKSI_LOG_LABELS) {
  if (aksi === "added") return "secondary" as const;
  if (aksi === "removed") return "destructive" as const;
  return "outline" as const;
}

export default async function KeluargaDetailPage({ params }: PageProps<"/keluarga/[id]">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KELUARGA_RESOURCE, "read")) {
    return <NoAccess title="Detail Kartu Keluarga" description="Anggota dan riwayat KK desa." />;
  }

  const { id } = await params;
  const familyId = Number(id);
  if (!Number.isInteger(familyId) || familyId <= 0) {
    return <NoAccess title="Detail Kartu Keluarga" description="Nomor KK tidak valid." />;
  }

  const detail = await getKeluargaDetail(familyId);
  const today = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title={keluargaLabel(detail.keluarga)}
        description="Anggota keluarga beserta riwayat perubahannya."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/keluarga">
                <ArrowLeft className="size-4" />
                Daftar KK
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`/keluarga/${detail.keluarga.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="size-4" />
                Cetak KK
              </a>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Identitas Keluarga</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Nomor KK</dt>
              <dd className="font-medium tabular-nums">{detail.keluarga.number}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Kepala Keluarga</dt>
              <dd className="font-medium">{detail.headName ?? "Belum ditentukan"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Alamat</dt>
              <dd className="font-medium">{detail.keluarga.address ?? "—"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Wilayah</dt>
              <dd className="font-medium">{detail.regionLabel ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" />
            Anggota ({detail.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detail.members.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada penduduk yang ditautkan ke Kartu Keluarga ini.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead className="w-44">NIK</TableHead>
                    <TableHead className="w-40">Hubungan</TableHead>
                    <TableHead className="w-28">Jenis Kelamin</TableHead>
                    <TableHead className="w-16">Usia</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.members.map((member) => {
                    const age = calculateAge(member.birthDate, today);
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="tabular-nums">
                          {member.nationalId ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {member.relationName ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{GENDER_LABELS[member.gender]}</TableCell>
                        <TableCell className="tabular-nums">
                          {age === null ? <span className="text-muted-foreground">—</span> : age}
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.lifeStatus === "alive" ? "secondary" : "outline"}>
                            {LIFE_STATUS_LABELS[member.lifeStatus]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4" />
            Riwayat Perubahan Anggota
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detail.logs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada perubahan anggota yang tercatat. Riwayat terisi otomatis saat penduduk
              ditambahkan, dipindahkan, atau hubungan keluarganya diubah.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-44">Waktu</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="w-44">Perubahan</TableHead>
                    <TableHead className="w-40">Hubungan</TableHead>
                    <TableHead className="w-40">Petugas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="tabular-nums">{formatWaktu(log.createdAt)}</TableCell>
                      <TableCell className="font-medium">{log.residentName}</TableCell>
                      <TableCell>
                        <Badge variant={aksiVariant(log.aksi)}>{AKSI_LOG_LABELS[log.aksi]}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.relationName ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {log.actorName ?? <span className="text-muted-foreground">Sistem</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
