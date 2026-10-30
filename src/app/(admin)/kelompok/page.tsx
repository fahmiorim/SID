import { Printer, Search, UsersRound } from "lucide-react";
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
import { listKelompok } from "@/features/kelompok/application/use-cases";
import {
  KELOMPOK_RESOURCE,
  KELOMPOK_TIPE,
  KELOMPOK_TIPE_SHORT_LABELS,
  kelompokTipeLabel,
  type KelompokTipe,
} from "@/features/kelompok/domain/kelompok";
import { KelompokCreateButton } from "@/features/kelompok/presentation/components/kelompok-create-button";
import { KelompokRowActions } from "@/features/kelompok/presentation/components/kelompok-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Kelompok & Lembaga",
};

const PAGE_SIZE = 10;

export default async function KelompokPage({ searchParams }: PageProps<"/kelompok">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KELOMPOK_RESOURCE, "read")) {
    return (
      <NoAccess title="Kelompok & Lembaga" description="Kelompok masyarakat dan lembaga desa." />
    );
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const tipe = typeof params.tipe === "string" ? params.tipe : "";
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = await listKelompok({
    search,
    tipe,
    categoryId: null,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const canManage = hasPermission(user.permissions, KELOMPOK_RESOURCE, "update");
  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const columns = canManage ? 6 : 5;

  const pageHref = (targetTipe: string, targetPage: number): string => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (targetTipe) query.set("tipe", targetTipe);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/kelompok?${qs}` : "/kelompok";
  };

  const tabs: { value: string; label: string }[] = [
    { value: "", label: "Semua" },
    ...KELOMPOK_TIPE.map((value) => ({
      value,
      label: KELOMPOK_TIPE_SHORT_LABELS[value],
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelompok & Lembaga"
        description="Master kelompok masyarakat dan lembaga desa."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Cetak
            </Button>
            {canManage ? (
              <KelompokCreateButton defaultTipe={(tipe as KelompokTipe) || "kelompok"} />
            ) : null}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              {tabs.map((tab) => {
                const active = tipe === tab.value;
                return (
                  <Button
                    key={tab.value || "semua"}
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href={pageHref(tab.value, 1)}>{tab.label}</Link>
                  </Button>
                );
              })}
            </div>

            <form method="get" className="flex flex-1 flex-wrap items-center gap-2 sm:max-w-sm">
              {tipe ? <input type="hidden" name="tipe" value={tipe} /> : null}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={search}
                  placeholder="Cari nama, kode, atau nomor SK…"
                  className="pl-8"
                  aria-label="Cari kelompok"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="w-32">Tipe</TableHead>
                  <TableHead className="w-44">Kategori</TableHead>
                  <TableHead className="w-48">Ketua</TableHead>
                  <TableHead className="w-24">Anggota</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UsersRound className="size-5" />
                        <p className="text-sm">
                          {search || tipe
                            ? "Tidak ada kelompok yang cocok dengan filter."
                            : "Belum ada data kelompok."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        {row.code ? (
                          <p className="text-xs text-muted-foreground">Kode: {row.code}</p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {kelompokTipeLabel(row.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.categoryName ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {row.leaderName ?? (
                          <span className="text-muted-foreground">Belum ada ketua</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{row.memberCount}</TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <KelompokRowActions kelompok={row} />
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
                    href={pageHref(tipe, Math.max(1, result.page - 1))}
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
                    href={pageHref(tipe, Math.min(result.pageCount, result.page + 1))}
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
