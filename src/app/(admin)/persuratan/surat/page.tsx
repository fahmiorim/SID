import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { findRoleById } from "@/features/rbac/infrastructure/rbac-repository";
import { listSuratWithMeta } from "@/features/surat/application/surat-use-cases";
import {
  formatTanggalIndonesia,
  LETTER_STATUS_LABELS,
  LETTER_STATUSES,
  SURAT_RESOURCE,
  type LetterStatus,
} from "@/features/surat/domain/surat";
import { SuratCreateButton } from "@/features/surat/presentation/components/surat-create-button";
import { SuratRowActions } from "@/features/surat/presentation/components/surat-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Layanan Surat",
};

function toStatus(value: string): LetterStatus | null {
  return (LETTER_STATUSES as readonly string[]).includes(value) ? (value as LetterStatus) : null;
}

export default async function SuratPage({ searchParams }: PageProps<"/persuratan/surat">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SURAT_RESOURCE, "read")) {
    return <NoAccess title="Layanan Surat" description="Arsip dan penerbitan surat desa." />;
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = toStatus(typeof params.status === "string" ? params.status : "");

  const { rows, total, jenis, penduduk, recap } = await listSuratWithMeta({ search, status });
  const canManage = hasPermission(user.permissions, SURAT_RESOURCE, "update");
  const role = user.roleId === null ? null : await findRoleById(user.roleId);

  const recapMap = new Map(recap.map((item) => [item.status, item.total]));
  const totalSurat = recap.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan Surat"
        description="Buat, terbitkan, dan cetak surat keterangan desa."
        actions={canManage ? <SuratCreateButton jenis={jenis} penduduk={penduduk} /> : null}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Surat", value: totalSurat, status: null as LetterStatus | null },
          ...LETTER_STATUSES.map((item) => ({
            label: LETTER_STATUS_LABELS[item],
            value: recapMap.get(item) ?? 0,
            status: item as LetterStatus | null,
          })),
        ].map((item) => (
          <Link
            key={item.label}
            href={item.status ? `/persuratan/surat?status=${item.status}` : "/persuratan/surat"}
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40"
          >
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <Input
              name="q"
              defaultValue={search}
              placeholder="Cari nomor, jenis, penduduk, atau keperluan…"
              className="flex-1 sm:max-w-sm"
              aria-label="Cari surat"
            />
            <select
              name="status"
              defaultValue={status ?? ""}
              aria-label="Saring status surat"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="">Semua status</option>
              {LETTER_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {LETTER_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search || status ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/persuratan/surat">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Nomor</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Penduduk</TableHead>
                  <TableHead className="w-36">Tanggal</TableHead>
                  <TableHead>Keperluan</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-14 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Mail className="size-5" />
                        <p className="text-sm">
                          {search || status ? "Tidak ada surat yang cocok." : "Belum ada surat."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium tabular-nums">
                        {row.number ?? <span className="text-muted-foreground">— konsep —</span>}
                      </TableCell>
                      <TableCell>
                        {row.typeName}
                        <span className="ml-1 text-xs text-muted-foreground">({row.typeCode})</span>
                      </TableCell>
                      <TableCell>{row.residentName ?? "—"}</TableCell>
                      <TableCell>{formatTanggalIndonesia(row.letterDate)}</TableCell>
                      <TableCell className="max-w-56 truncate">
                        {row.purpose || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "issued"
                              ? "secondary"
                              : row.status === "cancelled"
                                ? "outline"
                                : "outline"
                          }
                        >
                          {LETTER_STATUS_LABELS[row.status]}
                        </Badge>
                        {row.logVerifikasi === "ditolak" && row.catatanVerifikasi ? (
                          <p className="mt-1 max-w-40 text-xs text-destructive">
                            {row.catatanVerifikasi}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <SuratRowActions
                          surat={row}
                          jenis={jenis}
                          penduduk={penduduk}
                          canManage={canManage}
                          roleSlug={role?.slug ?? null}
                          isSuperadmin={user.permissions.isSuperadmin}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            Menampilkan {rows.length} dari {total} surat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
