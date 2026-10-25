import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

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
import { getAuditLogPageData } from "@/features/audit/application/audit-use-cases";
import { AUDIT_EVENT_LABELS, type AuditEvent } from "@/features/audit/domain/audit";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Log Aktivitas Keamanan",
};

function formatTanggal(value: Date): string {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function pageHref(page: number, search: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("q", search);
  const query = params.toString();
  return query ? `/pengaturan/log-aktivitas?${query}` : "/pengaturan/log-aktivitas";
}

function eventLabel(event: string): string {
  return event in AUDIT_EVENT_LABELS
    ? AUDIT_EVENT_LABELS[event as AuditEvent]
    : "Aktivitas lainnya";
}

export default async function LogAktivitasPage({
  searchParams,
}: PageProps<"/pengaturan/log-aktivitas">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.auditLog, "read")) {
    return (
      <NoAccess title="Log Aktivitas Keamanan" description="Riwayat aktivitas keamanan aplikasi." />
    );
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const data = await getAuditLogPageData({ page, search });
  const previousPage = Math.max(1, data.page - 1);
  const nextPage = Math.min(data.pageCount, data.page + 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Aktivitas Keamanan"
        description="Pantau login dan aktivitas keamanan yang tercatat untuk desa ini."
      />

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <div className="min-w-64 flex-1 space-y-1.5">
              <label htmlFor="q" className="text-xs text-muted-foreground">
                Cari aktivitas
              </label>
              <Input
                id="q"
                name="q"
                defaultValue={search}
                placeholder="Event, resource, ID, atau nama pengguna"
              />
            </div>
            <Button type="submit" variant="outline">
              Terapkan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Alamat IP</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                    <ShieldCheck className="mx-auto mb-2 size-5" />
                    Belum ada aktivitas yang cocok dengan filter ini.
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatTanggal(row.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.event.endsWith("failure") ? "destructive" : "secondary"}>
                        {eventLabel(row.event)}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.actorName ?? "Tidak teridentifikasi"}</TableCell>
                    <TableCell>
                      <p className="font-mono text-xs">{row.resource}</p>
                      {row.resourceId ? (
                        <p className="font-mono text-xs text-muted-foreground">{row.resourceId}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.ipAddress ?? "—"}</TableCell>
                    <TableCell className="max-w-64 text-xs break-words text-muted-foreground">
                      {row.details ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1}–
          {Math.min(data.page * data.pageSize, data.total)} dari {data.total} aktivitas
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild disabled={data.page <= 1}>
            <a href={pageHref(previousPage, search)}>
              <ChevronLeft className="size-4" />
              Sebelumnya
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild disabled={data.page >= data.pageCount}>
            <a href={pageHref(nextPage, search)}>
              Berikutnya
              <ChevronRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
