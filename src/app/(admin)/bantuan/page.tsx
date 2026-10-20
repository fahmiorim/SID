import { HandHeart, Search } from "lucide-react";
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
import { listBantuan } from "@/features/bantuan/application/use-cases";
import {
  asalDanaLabel,
  BANTUAN_RESOURCE,
  sasaranLabel,
  STATUS_MASA_AKTIF_LABELS,
  statusMasaAktif,
} from "@/features/bantuan/domain/bantuan";
import { BantuanCreateButton } from "@/features/bantuan/presentation/components/bantuan-create-button";
import { BantuanRowActions } from "@/features/bantuan/presentation/components/bantuan-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Bantuan Sosial",
};

const PAGE_SIZE = 10;

/** Rentang tanggal program dalam bentuk ringkas. */
function formatPeriode(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "Tanpa batas";
  return `${startDate ?? "…"} — ${endDate ?? "…"}`;
}

/** Warna badge sesuai status masa aktif. */
function statusVariant(status: ReturnType<typeof statusMasaAktif>) {
  if (status === "aktif") return "default" as const;
  if (status === "selesai") return "outline" as const;
  return "secondary" as const;
}

export default async function BantuanPage({ searchParams }: PageProps<"/bantuan">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, BANTUAN_RESOURCE, "read")) {
    return <NoAccess title="Bantuan Sosial" description="Program dan peserta bantuan desa." />;
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = await listBantuan({ search, page: requestedPage, pageSize: PAGE_SIZE });
  const canManage = hasPermission(user.permissions, BANTUAN_RESOURCE, "update");

  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const columns = canManage ? 7 : 6;

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/bantuan?${qs}` : "/bantuan";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bantuan Sosial"
        description="Program bantuan desa beserta sasaran, masa aktif, dan jumlah pesertanya."
        actions={canManage ? <BantuanCreateButton /> : null}
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={search}
                placeholder="Cari nama program…"
                className="pl-8"
                aria-label="Cari program bantuan"
              />
            </div>

            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/bantuan">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Program</TableHead>
                  <TableHead className="w-40">Sasaran</TableHead>
                  <TableHead className="w-44">Masa Aktif</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-32">Asal Dana</TableHead>
                  <TableHead className="w-24">Peserta</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <HandHeart className="size-5" />
                        <p className="text-sm">
                          {search
                            ? "Tidak ada program yang cocok dengan pencarian."
                            : "Belum ada program bantuan."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row) => {
                    const status = statusMasaAktif(row.startDate, row.endDate);
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">{row.name}</div>
                          {row.description ? (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {row.description}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell>{sasaranLabel(row.sasaran)}</TableCell>
                        <TableCell className="text-sm tabular-nums">
                          {formatPeriode(row.startDate, row.endDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(status)} className="text-xs">
                            {STATUS_MASA_AKTIF_LABELS[status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{asalDanaLabel(row.asalDana)}</TableCell>
                        <TableCell>
                          <div className="tabular-nums">{row.pesertaCount}</div>
                          {row.wilayahCount > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              {row.wilayahCount} wilayah
                            </p>
                          ) : null}
                        </TableCell>
                        {canManage ? (
                          <TableCell className="text-right">
                            <BantuanRowActions bantuan={row} />
                          </TableCell>
                        ) : null}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {result.total === 0
                ? "Tidak ada data"
                : `Menampilkan ${from}–${to} dari ${result.total} data`}
            </p>

            {result.pageCount > 1 ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild disabled={result.page <= 1}>
                  <Link
                    href={pageHref(Math.max(1, result.page - 1))}
                    aria-disabled={result.page <= 1}
                    className={result.page <= 1 ? "pointer-events-none opacity-50" : undefined}
                  >
                    Sebelumnya
                  </Link>
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {result.page} / {result.pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={result.page >= result.pageCount}
                >
                  <Link
                    href={pageHref(Math.min(result.pageCount, result.page + 1))}
                    aria-disabled={result.page >= result.pageCount}
                    className={
                      result.page >= result.pageCount ? "pointer-events-none opacity-50" : undefined
                    }
                  >
                    Berikutnya
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
