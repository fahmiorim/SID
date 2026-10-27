import { BarChart3, Home, Search, SlidersHorizontal } from "lucide-react";
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
import {
  getRtmFilterOptions,
  getRumahTanggaReference,
  listRumahTangga,
} from "@/features/rumah-tangga/application/use-cases";
import {
  filterRtmKeSearchParams,
  hitungFilterRtm,
  parseFilterRtm,
  RTM_BDT_FILTERS,
  RTM_BDT_LABELS,
  RUMAH_TANGGA_RESOURCE,
} from "@/features/rumah-tangga/domain/rumah-tangga";
import { RumahTanggaCreateButton } from "@/features/rumah-tangga/presentation/components/rumah-tangga-create-button";
import { RumahTanggaRowActions } from "@/features/rumah-tangga/presentation/components/rumah-tangga-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Rumah Tangga",
};

const PAGE_SIZE = 10;

export default async function RumahTanggaPage({ searchParams }: PageProps<"/rumah-tangga">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RUMAH_TANGGA_RESOURCE, "read")) {
    return <NoAccess title="Rumah Tangga" description="Data rumah tangga (RTM) desa." />;
  }

  const params = await searchParams;
  const filter = parseFilterRtm(params as Record<string, string | string[] | undefined>);
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = await listRumahTangga({ filter, page: requestedPage, pageSize: PAGE_SIZE });

  const canManage = hasPermission(user.permissions, RUMAH_TANGGA_RESOURCE, "update");
  const [reference, filterOptions] = await Promise.all([
    canManage ? getRumahTanggaReference() : Promise.resolve(null),
    getRtmFilterOptions(),
  ]);
  const filterAktif = hitungFilterRtm(filter);

  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const columns = canManage ? 6 : 5;

  const queryDasar = filterRtmKeSearchParams(filter);
  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams(queryDasar);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/rumah-tangga?${qs}` : "/rumah-tangga";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rumah Tangga"
        description="Daftar rumah tangga (RTM) beserta kepala rumah tangga dan jumlah anggotanya."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/rumah-tangga/laporan">
                <BarChart3 className="size-4" />
                Laporan
              </Link>
            </Button>
            {canManage && reference ? <RumahTanggaCreateButton reference={reference} /> : null}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={filter.search}
                placeholder="Cari nomor RTM, alamat, atau BDT…"
                className="pl-8"
                aria-label="Cari rumah tangga"
              />
            </div>

            <select
              name="kelasSosial"
              defaultValue={filter.kelasSosial ?? ""}
              aria-label="Saring kelas sosial"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="">Semua kelas sosial</option>
              {filterOptions.kelasSosial.map((kelas) => (
                <option key={kelas} value={kelas}>
                  Kelas {kelas}
                </option>
              ))}
            </select>

            <select
              name="bdt"
              defaultValue={filter.bdt ?? ""}
              aria-label="Saring kepemilikan BDT"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="">Semua BDT</option>
              {RTM_BDT_FILTERS.map((nilai) => (
                <option key={nilai} value={nilai}>
                  {RTM_BDT_LABELS[nilai]}
                </option>
              ))}
            </select>

            <select
              name="dusun"
              defaultValue={filter.dusun}
              aria-label="Saring dusun"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="">Semua dusun</option>
              {filterOptions.dusun.map((dusun) => (
                <option key={dusun} value={dusun}>
                  {dusun}
                </option>
              ))}
            </select>

            <Input
              name="rw"
              defaultValue={filter.rw}
              placeholder="RW"
              aria-label="Saring RW"
              className="w-20"
            />
            <Input
              name="rt"
              defaultValue={filter.rt}
              placeholder="RT"
              aria-label="Saring RT"
              className="w-20"
            />

            <Button type="submit" variant="outline">
              Cari
            </Button>
            {filterAktif > 0 || filter.search ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/rumah-tangga">Reset</Link>
              </Button>
            ) : null}
            {filterAktif > 0 ? (
              <Badge variant="secondary" className="gap-1">
                <SlidersHorizontal className="size-3" />
                {filterAktif} filter aktif
              </Badge>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Nomor RTM</TableHead>
                  <TableHead>Kepala Rumah Tangga</TableHead>
                  <TableHead className="w-24">Anggota</TableHead>
                  <TableHead className="w-56">Wilayah</TableHead>
                  <TableHead className="w-32">BDT</TableHead>
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
                          {filterAktif > 0 || filter.search
                            ? "Tidak ada rumah tangga yang cocok dengan filter."
                            : "Belum ada data rumah tangga."}
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
                      <TableCell className="tabular-nums">
                        {row.bdt ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      {canManage && reference ? (
                        <TableCell className="text-right">
                          <RumahTanggaRowActions rumahTangga={row} reference={reference} />
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
