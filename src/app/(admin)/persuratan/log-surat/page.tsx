import { History, Inbox, Send } from "lucide-react";
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
import { listLogSuratData } from "@/features/surat/application/agenda-use-cases";
import { SURAT_KELUAR_RESOURCE, SURAT_MASUK_RESOURCE } from "@/features/surat/domain/surat";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Log Surat",
};

const LABEL_AKSI: Record<string, string> = {
  disposisi: "Disposisi",
  ekspedisi: "Ekspedisi",
};

function formatWaktu(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

export default async function LogSuratPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const user = await verifySession();

  if (
    !hasPermission(user.permissions, SURAT_MASUK_RESOURCE, "read") ||
    !hasPermission(user.permissions, SURAT_KELUAR_RESOURCE, "read")
  ) {
    return (
      <NoAccess title="Log Surat" description="Riwayat aksi surat masuk dan surat keluar desa." />
    );
  }

  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : "all";
  const q = typeof params.q === "string" ? params.q : "";
  const hasil = await listLogSuratData({ type, q });
  const filterAktif = [
    { value: "all", label: "Semua", href: "/persuratan/log-surat" },
    { value: "masuk", label: "Surat Masuk", href: "/persuratan/log-surat?type=masuk" },
    { value: "keluar", label: "Surat Keluar", href: "/persuratan/log-surat?type=keluar" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Surat"
        description="Riwayat disposisi dan ekspedisi surat masuk/keluar desa."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/persuratan/surat-masuk">
                <Inbox className="size-4" />
                Surat Masuk
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/persuratan/surat-keluar">
                <Send className="size-4" />
                Surat Keluar
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {filterAktif.map((item) => (
          <Button
            key={item.value}
            variant={hasil.type === item.value ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={item.href} aria-current={hasil.type === item.value ? "page" : undefined}>
              {item.label}
            </Link>
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="type" value={hasil.type === "all" ? "" : hasil.type} />
            <Input
              name="q"
              defaultValue={hasil.q}
              placeholder="Cari nomor, perihal, aksi, atau catatan…"
              className="flex-1 sm:max-w-sm"
              aria-label="Cari log surat"
            />
            <Button type="submit" variant="outline">
              Cari
            </Button>
            {hasil.q ? (
              <Button type="button" variant="ghost" asChild>
                <Link
                  href={
                    hasil.type === "all"
                      ? "/persuratan/log-surat"
                      : `/persuratan/log-surat?type=${hasil.type}`
                  }
                >
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Waktu</TableHead>
                  <TableHead className="w-28">Jenis</TableHead>
                  <TableHead className="w-28">Aksi</TableHead>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead>Asal/Tujuan</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasil.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <History className="size-5" />
                        <p className="text-sm">
                          {hasil.q ? "Tidak ada log yang cocok." : "Belum ada log surat."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  hasil.rows.map((row) => (
                    <TableRow key={`${row.type}-${row.id}`}>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {formatWaktu(row.createdAt)}
                      </TableCell>
                      <TableCell>
                        {row.type === "keluar" ? "Surat Keluar" : "Surat Masuk"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {LABEL_AKSI[row.action] ?? row.action}
                      </TableCell>
                      <TableCell>{row.nomorSurat ?? "—"}</TableCell>
                      <TableCell className="max-w-64 truncate">{row.perihal ?? "—"}</TableCell>
                      <TableCell className="max-w-48 truncate">{row.lawan ?? "—"}</TableCell>
                      <TableCell className="max-w-64 truncate">{row.note ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            Menampilkan {hasil.rows.length} log surat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
