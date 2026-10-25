import { BarChart3, History, Search, Users } from "lucide-react";
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
import { getPendudukReference, listPenduduk } from "@/features/penduduk/application/use-cases";
import {
  calculateAge,
  GENDER_LABELS,
  LIFE_STATUS_LABELS,
  LIFE_STATUSES,
  PENDUDUK_RESOURCE,
  type LifeStatus,
} from "@/features/penduduk/domain/penduduk";
import { PendudukCreateButton } from "@/features/penduduk/presentation/components/penduduk-create-button";
import { PendudukRowActions } from "@/features/penduduk/presentation/components/penduduk-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { listWargaAccountsForResidents } from "@/features/warga/application/warga-use-cases";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Data Penduduk",
};

const PAGE_SIZE = 10;

function toLifeStatus(value: string): LifeStatus | null {
  return (LIFE_STATUSES as readonly string[]).includes(value) ? (value as LifeStatus) : null;
}

/** Warna lencana status kependudukan agar mudah dipindai. */
function lifeStatusVariant(status: LifeStatus): "secondary" | "outline" | "destructive" {
  if (status === "alive") return "secondary";
  if (status === "deceased" || status === "invalid") return "destructive";
  return "outline";
}

export default async function PendudukPage({ searchParams }: PageProps<"/penduduk">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PENDUDUK_RESOURCE, "read")) {
    return <NoAccess title="Data Penduduk" description="Buku kependudukan desa." />;
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const lifeStatus = toLifeStatus(typeof params.status === "string" ? params.status : "");
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = await listPenduduk({
    search,
    lifeStatus,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const canManage = hasPermission(user.permissions, PENDUDUK_RESOURCE, "update");
  const reference = canManage ? await getPendudukReference() : null;
  const akunWarga = canManage
    ? await listWargaAccountsForResidents(result.rows.map((row) => row.id))
    : new Map();

  const today = new Date();
  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const columns = canManage ? 8 : 7;

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (lifeStatus) query.set("status", lifeStatus);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/penduduk?${qs}` : "/penduduk";
  };

  const resetHref = "/penduduk";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Penduduk"
        description="Buku kependudukan desa beserta data sosial dan domisili warga."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/penduduk/riwayat">
                <History className="size-4" />
                Riwayat
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/penduduk/laporan">
                <BarChart3 className="size-4" />
                Laporan
              </Link>
            </Button>
            {canManage && reference ? <PendudukCreateButton reference={reference} /> : null}
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
                defaultValue={search}
                placeholder="Cari nama, NIK, atau No. KK…"
                className="pl-8"
                aria-label="Cari penduduk"
              />
            </div>

            <select
              name="status"
              defaultValue={lifeStatus ?? ""}
              aria-label="Saring status kependudukan"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="">Semua status</option>
              {LIFE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LIFE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search || lifeStatus ? (
              <Button type="button" variant="ghost" asChild>
                <Link href={resetHref}>Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="w-40">NIK</TableHead>
                  <TableHead className="w-40">Kartu Keluarga</TableHead>
                  <TableHead className="w-28">Jenis Kelamin</TableHead>
                  <TableHead className="w-16">Usia</TableHead>
                  <TableHead className="w-48">Wilayah</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="size-5" />
                        <p className="text-sm">
                          {search || lifeStatus
                            ? "Tidak ada penduduk yang cocok dengan pencarian."
                            : "Belum ada data penduduk."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row) => {
                    const age = calculateAge(row.birthDate, today);

                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="tabular-nums">
                          {row.nationalId ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {row.familyNumber ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{GENDER_LABELS[row.gender]}</TableCell>
                        <TableCell className="tabular-nums">
                          {age === null ? <span className="text-muted-foreground">—</span> : age}
                        </TableCell>
                        <TableCell>
                          {row.regionLabel ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lifeStatusVariant(row.lifeStatus)}>
                            {LIFE_STATUS_LABELS[row.lifeStatus]}
                          </Badge>
                        </TableCell>
                        {canManage && reference ? (
                          <TableCell className="text-right">
                            <PendudukRowActions
                              penduduk={row}
                              reference={reference}
                              akunWarga={akunWarga.get(row.id) ?? null}
                            />
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
