import { FileCheck2, FileClock, FileText, FileX2, Mail, Search, Settings } from "lucide-react";
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
import { hasPermission } from "@/features/rbac/application/authorization";
import { getPeranSesi } from "@/features/rbac/application/grup-use-cases";
import { listSuratWithMeta } from "@/features/surat/application/surat-use-cases";
import {
  formatTanggalIndonesia,
  LETTER_STATUS_LABELS,
  LETTER_STATUSES,
  SURAT_PER_HALAMAN,
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

function statusBadgeClass(status: LetterStatus): string {
  if (status === "issued") return "border-transparent bg-[var(--brand-soft)] text-[var(--brand)]";
  if (status === "verifikasi") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "cancelled") return "border-destructive/20 bg-destructive/5 text-destructive";
  return "border-black/10 bg-muted text-muted-foreground";
}

export default async function SuratPage({ searchParams }: PageProps<"/persuratan/surat">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SURAT_RESOURCE, "read")) {
    return <NoAccess title="Layanan Surat" description="Arsip dan penerbitan surat desa." />;
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = toStatus(typeof params.status === "string" ? params.status : "");
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const {
    rows,
    total,
    page: halaman,
    pageCount,
    jenis,
    penduduk,
    recap,
    syarat,
  } = await listSuratWithMeta({
    search,
    status,
    page: requestedPage,
    pageSize: SURAT_PER_HALAMAN,
  });
  const canManage = hasPermission(user.permissions, SURAT_RESOURCE, "update");
  const peran = user.roleId === null ? null : await getPeranSesi(user.roleId);

  const recapMap = new Map(recap.map((item) => [item.status, item.total]));
  const totalSurat = recap.reduce((sum, item) => sum + item.total, 0);
  const from = total === 0 ? 0 : (halaman - 1) * SURAT_PER_HALAMAN + 1;
  const to = Math.min(halaman * SURAT_PER_HALAMAN, total);

  const queryDasar = new URLSearchParams();
  if (search) queryDasar.set("q", search);
  if (status) queryDasar.set("status", status);
  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams(queryDasar);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/persuratan/surat?${qs}` : "/persuratan/surat";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan Surat"
        description="Buat, terbitkan, dan cetak surat keterangan desa."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/persuratan/surat/arsip">Arsip nomor</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pengaturan/lampiran">
                <Settings className="size-4" aria-hidden />
                Pengaturan lampiran
              </Link>
            </Button>
            {canManage ? <SuratCreateButton jenis={jenis} penduduk={penduduk} /> : null}
          </div>
        }
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          {
            label: "Total Surat",
            value: totalSurat,
            status: null as LetterStatus | null,
            ikon: Mail,
            keterangan: "Seluruh status",
          },
          ...LETTER_STATUSES.map((item) => ({
            label: LETTER_STATUS_LABELS[item],
            value: recapMap.get(item) ?? 0,
            status: item as LetterStatus | null,
            ikon:
              item === "issued"
                ? FileCheck2
                : item === "verifikasi"
                  ? FileClock
                  : item === "cancelled"
                    ? FileX2
                    : FileText,
            keterangan:
              item === "issued"
                ? "Siap dicetak"
                : item === "verifikasi"
                  ? "Perlu ditinjau"
                  : item === "cancelled"
                    ? "Tidak berlaku"
                    : "Belum diterbitkan",
          })),
        ].map((item) => {
          const aktif = status === item.status;
          return (
            <Link
              key={item.label}
              href={item.status ? `/persuratan/surat?status=${item.status}` : "/persuratan/surat"}
              className={`block rounded-2xl ${
                item.status === "cancelled" ? "col-span-2 xl:col-span-1" : ""
              }`}
              aria-current={aktif ? "page" : undefined}
            >
              <AdminStat
                utama={item.status === null}
                label={item.label}
                nilai={item.value.toLocaleString("id-ID")}
                keterangan={item.keterangan}
                ikon={item.ikon}
                className={
                  aktif && item.status !== null
                    ? "ring-2 ring-[var(--brand)]/35 ring-offset-2 ring-offset-background"
                    : undefined
                }
              />
            </Link>
          );
        })}
      </section>

      <AdminListPanel
        toolbar={
          <form method="get" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Pencarian &amp; status
              </p>
              {search || status ? (
                <Badge
                  variant="secondary"
                  className="border-transparent bg-[var(--brand-soft)] text-[var(--brand)]"
                >
                  Filter diterapkan
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-56 flex-1 sm:max-w-md">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  name="q"
                  defaultValue={search}
                  placeholder="Cari nomor, jenis, penduduk, atau keperluan…"
                  className="h-9 rounded-lg border-black/10 bg-white/80 pl-8"
                  aria-label="Cari surat"
                />
              </div>
              <select
                name="status"
                defaultValue={status ?? ""}
                aria-label="Saring status surat"
                className="h-9 rounded-lg border border-black/10 bg-white/80 px-2.5 text-base transition-colors outline-none focus-visible:border-[var(--brand)] focus-visible:ring-3 focus-visible:ring-[var(--brand)]/15 md:text-sm"
              >
                <option value="">Semua status</option>
                {LETTER_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {LETTER_STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-strong)]"
              >
                Cari
              </Button>
              {search || status ? (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/persuratan/surat">Reset</Link>
                </Button>
              ) : null}
            </div>
          </form>
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {total === 0
                ? "Tidak ada surat"
                : `Menampilkan ${from}–${to} dari ${total.toLocaleString("id-ID")} surat`}
            </p>

            {pageCount > 1 ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={pageHref(Math.max(1, halaman - 1))}
                    aria-disabled={halaman <= 1}
                    className={halaman <= 1 ? "pointer-events-none opacity-50" : undefined}
                  >
                    Sebelumnya
                  </Link>
                </Button>
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand)] tabular-nums">
                  {halaman} / {pageCount}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={pageHref(Math.min(pageCount, halaman + 1))}
                    aria-disabled={halaman >= pageCount}
                    className={halaman >= pageCount ? "pointer-events-none opacity-50" : undefined}
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
            {rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                <Mail className="size-5" aria-hidden="true" />
                <p className="text-sm">
                  {search || status ? "Tidak ada surat yang cocok." : "Belum ada surat."}
                </p>
              </div>
            ) : (
              rows.map((row) => (
                <article
                  key={row.id}
                  className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold tabular-nums">
                        {row.number ?? "— konsep —"}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatTanggalIndonesia(row.letterDate)}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusBadgeClass(row.status)}>
                      {LETTER_STATUS_LABELS[row.status]}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{row.typeName}</p>
                    <span className="inline-flex rounded-md bg-[var(--warm-paper)] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {row.typeCode}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-black/[0.05] pt-3 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Penduduk</dt>
                      <dd className="mt-0.5 truncate">{row.residentName ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Keperluan</dt>
                      <dd className="mt-0.5 truncate">{row.purpose || "—"}</dd>
                    </div>
                  </dl>

                  {row.logVerifikasi === "ditolak" && row.catatanVerifikasi ? (
                    <p className="mt-2 text-xs text-destructive">{row.catatanVerifikasi}</p>
                  ) : null}

                  <div className="mt-3 flex justify-end border-t border-black/[0.05] pt-2">
                    <SuratRowActions
                      surat={row}
                      jenis={jenis}
                      penduduk={penduduk}
                      syarat={syarat}
                      canManage={canManage}
                      roleSlug={peran?.slug ?? null}
                      isSuperadmin={user.permissions.isSuperadmin}
                    />
                  </div>
                </article>
              ))
            )}
          </div>
        </MobileOnly>

        <div className="hidden md:block print:block">
          <AdminTableFrame>
            <Table aria-label="Daftar surat">
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
                        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                          <Mail className="size-5" aria-hidden="true" />
                        </span>
                        <p className="text-sm">
                          {search || status ? "Tidak ada surat yang cocok." : "Belum ada surat."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-medium tabular-nums">
                        {row.number ?? <span className="text-muted-foreground">— konsep —</span>}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{row.typeName}</span>
                        <span className="ml-2 inline-flex rounded-md bg-[var(--warm-paper)] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {row.typeCode}
                        </span>
                      </TableCell>
                      <TableCell>{row.residentName ?? "—"}</TableCell>
                      <TableCell>{formatTanggalIndonesia(row.letterDate)}</TableCell>
                      <TableCell className="max-w-56 truncate">
                        {row.purpose || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClass(row.status)}>
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
                          syarat={syarat}
                          canManage={canManage}
                          roleSlug={peran?.slug ?? null}
                          isSuperadmin={user.permissions.isSuperadmin}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTableFrame>
        </div>
      </AdminListPanel>
    </div>
  );
}
