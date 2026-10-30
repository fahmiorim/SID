import { Map, Search } from "lucide-react";
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
import { hasPermission } from "@/features/rbac/application/authorization";
import { listWilayah } from "@/features/wilayah/application/use-cases";
import { WILAYAH_RESOURCE } from "@/features/wilayah/domain/wilayah";
import { WilayahCreateButton } from "@/features/wilayah/presentation/components/wilayah-create-button";
import { WilayahRowActions } from "@/features/wilayah/presentation/components/wilayah-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Wilayah",
};

const PAGE_SIZE = 10;

export default async function WilayahPage({ searchParams }: PageProps<"/wilayah">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, WILAYAH_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Wilayah Administratif"
        description="Dusun, RW, dan RT yang terdaftar pada desa ini."
      />
    );
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = await listWilayah({ search, page: requestedPage, pageSize: PAGE_SIZE });

  const canManage = hasPermission(user.permissions, WILAYAH_RESOURCE, "update");
  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/wilayah?${qs}` : "/wilayah";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wilayah Administratif"
        description="Dusun, RW, dan RT yang terdaftar pada desa ini."
        actions={canManage ? <WilayahCreateButton /> : null}
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={search}
                placeholder="Cari dusun, RW, atau RT…"
                className="pl-8"
                aria-label="Cari wilayah"
              />
            </div>
            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/wilayah">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Urut</TableHead>
                  <TableHead>Dusun</TableHead>
                  <TableHead className="w-28">RW</TableHead>
                  <TableHead className="w-28">RT</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5 : 4} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Map className="size-5" />
                        <p className="text-sm">
                          {search
                            ? "Tidak ada wilayah yang cocok dengan pencarian."
                            : "Belum ada data wilayah."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {row.urut}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.dusun || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {row.rw || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {row.rt || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <WilayahRowActions wilayah={row} />
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

<div className="flex flex-wrap items-center gap-2">
  <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
    Cetak
  </Button>
  <Button asChild variant="outline" size="sm">
    <Link href="/wilayah/rekap">Rekap Wilayah</Link>
  </Button>
</div>;
