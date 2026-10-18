import { Home, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
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
import { getKeluargaReference, listKeluarga } from "@/features/keluarga/application/use-cases";
import { KELUARGA_RESOURCE } from "@/features/keluarga/domain/keluarga";
import { KeluargaCreateButton } from "@/features/keluarga/presentation/components/keluarga-create-button";
import { KeluargaRowActions } from "@/features/keluarga/presentation/components/keluarga-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Kartu Keluarga",
};

const PAGE_SIZE = 10;

export default async function KeluargaPage({ searchParams }: PageProps<"/keluarga">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KELUARGA_RESOURCE, "read")) {
    return <NoAccess title="Kartu Keluarga" description="Data Kartu Keluarga (KK) desa." />;
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = await listKeluarga({ search, page: requestedPage, pageSize: PAGE_SIZE });

  const canManage = hasPermission(user.permissions, KELUARGA_RESOURCE, "update");
  const reference = canManage ? await getKeluargaReference() : null;

  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const columns = canManage ? 5 : 4;

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/keluarga?${qs}` : "/keluarga";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kartu Keluarga"
        description="Daftar Kartu Keluarga (KK) beserta kepala keluarga dan jumlah anggotanya."
        actions={canManage && reference ? <KeluargaCreateButton reference={reference} /> : null}
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={search}
                placeholder="Cari nomor KK atau alamat…"
                className="pl-8"
                aria-label="Cari Kartu Keluarga"
              />
            </div>

            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/keluarga">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Nomor KK</TableHead>
                  <TableHead>Kepala Keluarga</TableHead>
                  <TableHead className="w-24">Anggota</TableHead>
                  <TableHead className="w-56">Wilayah</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Home className="size-5" />
                        <p className="text-sm">
                          {search
                            ? "Tidak ada Kartu Keluarga yang cocok dengan pencarian."
                            : "Belum ada data Kartu Keluarga."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium tabular-nums">{row.number}</TableCell>
                      <TableCell>
                        {row.headName ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="tabular-nums">{row.memberCount}</TableCell>
                      <TableCell>
                        {row.regionLabel ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      {canManage && reference ? (
                        <TableCell className="text-right">
                          <KeluargaRowActions keluarga={row} reference={reference} />
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
