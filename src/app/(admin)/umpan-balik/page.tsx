import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { getDaftarUmpanBalik } from "@/features/umpan-balik/application/umpan-balik-use-cases";
import {
  isUmpanBalikStatus,
  labelStatusUmpanBalik,
  UMPAN_BALIK_RESOURCE,
  UMPAN_BALIK_STATUS,
  UMPAN_BALIK_STATUS_LABELS,
} from "@/features/umpan-balik/domain/umpan-balik";
import { ubahStatusUmpanBalikFormAction } from "@/features/umpan-balik/presentation/admin-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Umpan Balik" };

function formatTanggal(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    value,
  );
}

export default async function UmpanBalikPage({ searchParams }: PageProps<"/umpan-balik">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, UMPAN_BALIK_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Umpan Balik"
        description="Masukan dan saran warga yang dikirim melalui halaman kontak publik."
      />
    );
  }

  const params = await searchParams;
  const status =
    typeof params.status === "string" && isUmpanBalikStatus(params.status) ? params.status : "";
  const rows = await getDaftarUmpanBalik(status);
  const canManage = hasPermission(user.permissions, UMPAN_BALIK_RESOURCE, "update");

  const tabs: { value: string; label: string }[] = [
    { value: "", label: "Semua" },
    ...UMPAN_BALIK_STATUS.map((value) => ({
      value,
      label: UMPAN_BALIK_STATUS_LABELS[value],
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Umpan Balik"
        description="Masukan warga dari formulir kontak publik, lengkap dengan status tindak lanjut."
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.value || "semua"}
                variant={status === tab.value ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={tab.value ? `/umpan-balik?status=${tab.value}` : "/umpan-balik"}>
                  {tab.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Tanggal</TableHead>
                  <TableHead className="w-48">Pengirim</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  {canManage ? <TableHead className="w-64">Tindak lanjut</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5 : 4} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <MessageSquare className="size-5" />
                        <p className="text-sm">
                          {status
                            ? "Tidak ada umpan balik dengan status ini."
                            : "Belum ada umpan balik dari warga."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} className="align-top">
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTanggal(row.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p className="font-medium">{row.nama ?? "Anonim"}</p>
                        {row.kontak ? (
                          <p className="text-xs text-muted-foreground">{row.kontak}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-xl text-sm whitespace-pre-line">
                        {row.pesan}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.status === "baru" ? "default" : "secondary"}>
                          {labelStatusUmpanBalik(row.status)}
                        </Badge>
                      </TableCell>
                      {canManage ? (
                        <TableCell>
                          <form action={ubahStatusUmpanBalikFormAction} className="flex gap-2">
                            <input type="hidden" name="id" value={row.id} />
                            <select
                              name="status"
                              defaultValue={row.status}
                              className="h-9 rounded-md border bg-background px-2 text-sm"
                              aria-label={`Status umpan balik ${row.id}`}
                            >
                              {UMPAN_BALIK_STATUS.map((value) => (
                                <option key={value} value={value}>
                                  {UMPAN_BALIK_STATUS_LABELS[value]}
                                </option>
                              ))}
                            </select>
                            <Button type="submit" variant="outline" size="sm">
                              Simpan
                            </Button>
                          </form>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
