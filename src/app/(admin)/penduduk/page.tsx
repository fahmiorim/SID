import { BarChart3, FileDown, History, Search, SlidersHorizontal, Users } from "lucide-react";
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
  filterKeSearchParams,
  GENDER_LABELS,
  GENDERS,
  hitungFilterPenduduk,
  LIFE_STATUS_LABELS,
  LIFE_STATUSES,
  parseFilterPenduduk,
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

/** Kelas bersama untuk seluruh select filter agar tampil seragam. */
const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

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
  const filter = parseFilterPenduduk(params as Record<string, string | string[] | undefined>);
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const reference = await getPendudukReference();
  const result = await listPenduduk({
    filter,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const canManage = hasPermission(user.permissions, PENDUDUK_RESOURCE, "update");
  const akunWarga = canManage
    ? await listWargaAccountsForResidents(result.rows.map((row) => row.id))
    : new Map();

  const today = new Date();
  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const columns = canManage ? 8 : 7;
  const filterAktif = hitungFilterPenduduk(filter);

  const queryDasar = filterKeSearchParams(filter);
  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams(queryDasar);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/penduduk?${qs}` : "/penduduk";
  };

  const eksporHref = `/penduduk/ekspor?${queryDasar.toString()}`;

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
            <Button variant="outline" asChild>
              <a href={eksporHref}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            {canManage ? <PendudukCreateButton reference={reference} /> : null}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-56 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={filter.search}
                  placeholder="Cari nama, NIK, atau No. KK…"
                  className="pl-8"
                  aria-label="Cari penduduk"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
              {filterAktif > 0 || filter.search ? (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/penduduk">Reset</Link>
                </Button>
              ) : null}
              {filterAktif > 0 ? (
                <Badge variant="secondary" className="gap-1">
                  <SlidersHorizontal className="size-3" />
                  {filterAktif} filter aktif
                </Badge>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <select
                name="status"
                defaultValue={filter.lifeStatus ?? ""}
                aria-label="Saring status kependudukan"
                className={SELECT_CLASS}
              >
                <option value="">Semua status</option>
                {LIFE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {LIFE_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>

              <select
                name="gender"
                defaultValue={filter.gender ?? ""}
                aria-label="Saring jenis kelamin"
                className={SELECT_CLASS}
              >
                <option value="">Semua jenis kelamin</option>
                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {GENDER_LABELS[gender]}
                  </option>
                ))}
              </select>

              <select
                name="religionId"
                defaultValue={filter.religionId ?? ""}
                aria-label="Saring agama"
                className={SELECT_CLASS}
              >
                <option value="">Semua agama</option>
                {reference.religions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                name="educationId"
                defaultValue={filter.educationId ?? ""}
                aria-label="Saring pendidikan"
                className={SELECT_CLASS}
              >
                <option value="">Semua pendidikan</option>
                {reference.educations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                name="occupationId"
                defaultValue={filter.occupationId ?? ""}
                aria-label="Saring pekerjaan"
                className={SELECT_CLASS}
              >
                <option value="">Semua pekerjaan</option>
                {reference.occupations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                name="maritalStatusId"
                defaultValue={filter.maritalStatusId ?? ""}
                aria-label="Saring status kawin"
                className={SELECT_CLASS}
              >
                <option value="">Semua status kawin</option>
                {reference.maritalStatuses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                name="dusun"
                defaultValue={filter.dusun}
                aria-label="Saring dusun"
                className={SELECT_CLASS}
              >
                <option value="">Semua dusun</option>
                {reference.dusun.map((dusun) => (
                  <option key={dusun} value={dusun}>
                    {dusun}
                  </option>
                ))}
              </select>

              <select
                name="rw"
                defaultValue={filter.rw}
                aria-label="Saring RW"
                className={SELECT_CLASS}
              >
                <option value="">Semua RW</option>
                {reference.rw.map((rw) => (
                  <option key={rw} value={rw}>
                    RW {rw}
                  </option>
                ))}
              </select>

              <select
                name="rt"
                defaultValue={filter.rt}
                aria-label="Saring RT"
                className={SELECT_CLASS}
              >
                <option value="">Semua RT</option>
                {reference.rt.map((rt) => (
                  <option key={rt} value={rt}>
                    RT {rt}
                  </option>
                ))}
              </select>

              <Input
                name="umurMin"
                type="number"
                min={0}
                defaultValue={filter.umurMin ?? ""}
                placeholder="Umur minimal"
                aria-label="Umur minimal"
              />
              <Input
                name="umurMax"
                type="number"
                min={0}
                defaultValue={filter.umurMax ?? ""}
                placeholder="Umur maksimal"
                aria-label="Umur maksimal"
              />
            </div>
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
                          {filterAktif > 0 || filter.search
                            ? "Tidak ada penduduk yang cocok dengan filter."
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
                        {canManage ? (
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
