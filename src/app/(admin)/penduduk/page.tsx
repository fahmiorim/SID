import {
  BarChart3,
  FileDown,
  History,
  Layers3,
  Rows3,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminListPanel, AdminStat, AdminTableFrame } from "@/components/layout/admin-list";
import { PageHeader } from "@/components/layout/page-header";
import { MobileOnly } from "@/components/shared/mobile-only";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  "h-9 rounded-lg border border-black/10 bg-white/80 px-2 text-[13px] outline-none transition-colors focus-visible:border-[var(--brand)] focus-visible:ring-3 focus-visible:ring-[var(--brand)]/15 md:px-2.5 md:text-sm";

/** Warna lencana status kependudukan agar mudah dipindai. */
function lifeStatusVariant(status: LifeStatus): "secondary" | "outline" | "destructive" {
  if (status === "alive") return "secondary";
  if (status === "deceased" || status === "invalid") return "destructive";
  return "outline";
}

function inisialPenduduk(nama: string): string {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((bagian) => bagian.charAt(0).toUpperCase())
    .join("");
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

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminStat
          utama
          label="Total penduduk"
          nilai={result.total.toLocaleString("id-ID")}
          keterangan={filterAktif > 0 || filter.search ? "Data yang cocok" : "Seluruh data desa"}
          ikon={Users}
        />
        <AdminStat
          label="Ditampilkan"
          nilai={result.total === 0 ? "0" : `${from}–${to}`}
          keterangan={`Dari ${result.total.toLocaleString("id-ID")} data`}
          ikon={Rows3}
        />
        <AdminStat
          label="Halaman"
          nilai={`${result.page} / ${result.pageCount}`}
          keterangan="10 data per halaman"
          ikon={Layers3}
        />
        <AdminStat
          label="Filter aktif"
          nilai={filterAktif}
          keterangan={
            filter.search
              ? "Termasuk pencarian"
              : filterAktif > 0
                ? "Saringan diterapkan"
                : "Belum ada filter"
          }
          ikon={SlidersHorizontal}
        />
      </section>

      <AdminListPanel
        toolbar={
          <form method="get" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Pencarian &amp; filter
              </p>
              {filterAktif > 0 ? (
                <Badge
                  variant="secondary"
                  className="gap-1 border-transparent bg-[var(--brand-soft)] text-[var(--brand)]"
                >
                  <SlidersHorizontal className="size-3" aria-hidden="true" />
                  {filterAktif} filter aktif
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-56 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  name="q"
                  defaultValue={filter.search}
                  placeholder="Cari nama, NIK, atau No. KK…"
                  className="h-9 rounded-lg border-black/10 bg-white/80 pl-8"
                  aria-label="Cari penduduk"
                />
              </div>
              <Button
                type="submit"
                className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-strong)]"
              >
                Cari
              </Button>
              {filterAktif > 0 || filter.search ? (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/penduduk">Reset</Link>
                </Button>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
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
                className="h-9 rounded-lg border-black/10 bg-white/80"
              />
              <Input
                name="umurMax"
                type="number"
                min={0}
                defaultValue={filter.umurMax ?? ""}
                placeholder="Umur maksimal"
                aria-label="Umur maksimal"
                className="h-9 rounded-lg border-black/10 bg-white/80"
              />
            </div>
          </form>
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {result.total === 0
                ? "Tidak ada data"
                : `Menampilkan ${from}–${to} dari ${result.total.toLocaleString("id-ID")} data`}
            </p>

            {result.pageCount > 1 ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={pageHref(Math.max(1, result.page - 1))}
                    aria-disabled={result.page <= 1}
                    className={result.page <= 1 ? "pointer-events-none opacity-50" : undefined}
                  >
                    Sebelumnya
                  </Link>
                </Button>
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand)] tabular-nums">
                  {result.page} / {result.pageCount}
                </span>
                <Button variant="outline" size="sm" asChild>
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
        }
      >
        <MobileOnly>
          <div className="space-y-3">
            {result.rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                <Users className="size-5" aria-hidden="true" />
                <p className="text-sm">
                  {filterAktif > 0 || filter.search
                    ? "Tidak ada penduduk yang cocok dengan filter."
                    : "Belum ada data penduduk."}
                </p>
              </div>
            ) : (
              result.rows.map((row) => {
                const age = calculateAge(row.birthDate, today);
                return (
                  <article
                    key={row.id}
                    className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xs font-semibold text-[var(--brand)]">
                          {inisialPenduduk(row.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{row.name}</p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                            {row.nationalId ?? "NIK belum diisi"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={lifeStatusVariant(row.lifeStatus)}
                        className={
                          row.lifeStatus === "alive"
                            ? "border-transparent bg-[var(--brand-soft)] text-[var(--brand)]"
                            : undefined
                        }
                      >
                        {LIFE_STATUS_LABELS[row.lifeStatus]}
                      </Badge>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-black/[0.05] pt-3 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Kartu Keluarga</dt>
                        <dd className="mt-0.5 truncate font-mono">{row.familyNumber ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Jenis Kelamin</dt>
                        <dd className="mt-0.5">{GENDER_LABELS[row.gender]}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Usia</dt>
                        <dd className="mt-0.5 tabular-nums">
                          {age === null ? "—" : `${age} tahun`}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Wilayah</dt>
                        <dd className="mt-0.5 truncate">{row.regionLabel ?? "—"}</dd>
                      </div>
                    </dl>

                    {canManage ? (
                      <div className="mt-3 flex justify-end border-t border-black/[0.05] pt-2">
                        <PendudukRowActions
                          penduduk={row}
                          reference={reference}
                          akunWarga={akunWarga.get(row.id) ?? null}
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </MobileOnly>

        <div className="hidden md:block print:block">
          <AdminTableFrame>
            <Table aria-label="Daftar penduduk">
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
                        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                          <Users className="size-5" aria-hidden="true" />
                        </span>
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
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[11px] font-semibold text-[var(--brand)]">
                              {inisialPenduduk(row.name)}
                            </span>
                            <span className="font-medium">{row.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                          {row.nationalId ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
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
                          <Badge
                            variant={lifeStatusVariant(row.lifeStatus)}
                            className={
                              row.lifeStatus === "alive"
                                ? "border-transparent bg-[var(--brand-soft)] text-[var(--brand)]"
                                : undefined
                            }
                          >
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
          </AdminTableFrame>
        </div>
      </AdminListPanel>
    </div>
  );
}
