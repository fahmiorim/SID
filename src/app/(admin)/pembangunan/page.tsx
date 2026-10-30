import { HardHat, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPembangunan, listTahunAnggaran } from "@/features/pembangunan/application/use-cases";
import {
  formatAnggaran,
  PEMBANGUNAN_RESOURCE,
  STATUS_PEMBANGUNAN,
  STATUS_PEMBANGUNAN_LABELS,
  statusPembangunanLabel,
} from "@/features/pembangunan/domain/pembangunan";
import { PembangunanCreateButton } from "@/features/pembangunan/presentation/components/pembangunan-create-button";
import { PembangunanRowActions } from "@/features/pembangunan/presentation/components/pembangunan-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pembangunan Desa",
};

const PAGE_SIZE = 10;

function statusVariant(status: string) {
  if (status === "selesai") return "default" as const;
  if (status === "berjalan") return "secondary" as const;
  if (status === "dibatalkan") return "outline" as const;
  return "secondary" as const;
}

export default async function PembangunanPage({ searchParams }: PageProps<"/pembangunan">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PEMBANGUNAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Pembangunan Desa"
        description="Rencana, realisasi, dan hasil proyek pembangunan desa."
      />
    );
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "";
  const tahunParam = Number(typeof params.tahun === "string" ? params.tahun : "");
  const tahun = Number.isInteger(tahunParam) && tahunParam > 0 ? tahunParam : null;
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const [result, tahunList] = await Promise.all([
    listPembangunan({ search, tahun, status, page: requestedPage, pageSize: PAGE_SIZE }),
    listTahunAnggaran(),
  ]);
  const canManage = hasPermission(user.permissions, PEMBANGUNAN_RESOURCE, "update");

  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const columns = canManage ? 9 : 8;

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (tahun !== null) query.set("tahun", String(tahun));
    if (status) query.set("status", status);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/pembangunan?${qs}` : "/pembangunan";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pembangunan Desa"
        description="Daftar proyek pembangunan beserta anggaran, progres, dan dokumentasinya."
        actions={canManage ? <PembangunanCreateButton /> : null}
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={search}
                placeholder="Cari judul, lokasi…"
                className="pl-8"
                aria-label="Cari proyek pembangunan"
              />
            </div>

            <Select name="tahun" defaultValue={tahun !== null ? String(tahun) : "semua"}>
              <SelectTrigger className="w-36" aria-label="Filter tahun anggaran">
                <SelectValue placeholder="Semua tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua tahun</SelectItem>
                {tahunList.map((item) => (
                  <SelectItem key={item} value={String(item)}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="status" defaultValue={status !== "" ? status : "semua"}>
              <SelectTrigger className="w-36" aria-label="Filter status">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua status</SelectItem>
                {STATUS_PEMBANGUNAN.map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_PEMBANGUNAN_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" variant="outline">
              Terapkan
            </Button>
            {search || tahun !== null || status ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/pembangunan">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyek</TableHead>
                  <TableHead className="w-20">Tahun</TableHead>
                  <TableHead className="w-40">Sumber Dana</TableHead>
                  <TableHead className="w-40">Anggaran</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-32">Progres</TableHead>
                  <TableHead className="w-36">Pelaksana</TableHead>
                  <TableHead className="w-28">Lokasi</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <HardHat className="size-5" />
                        <p className="text-sm">
                          {search || tahun !== null || status
                            ? "Tidak ada proyek yang cocok dengan filter."
                            : "Belum ada proyek pembangunan."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link
                          href={`/pembangunan/${row.id}`}
                          className="font-medium hover:underline"
                        >
                          {row.judul}
                        </Link>
                        {row.deskripsi ? (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {row.deskripsi}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="tabular-nums">{row.tahunAnggaran}</TableCell>
                      <TableCell>{row.sumberDana ?? "-"}</TableCell>
                      <TableCell className="tabular-nums">{formatAnggaran(row.anggaran)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)} className="text-xs">
                          {statusPembangunanLabel(row.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, Math.max(0, row.progres))}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums">{row.progres}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{row.pelaksana ?? "-"}</TableCell>
                      <TableCell className="text-sm">{row.lokasi ?? "-"}</TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <PembangunanRowActions proyek={row} />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
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
