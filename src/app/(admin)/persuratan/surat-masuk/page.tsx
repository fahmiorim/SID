import { Inbox, Printer } from "lucide-react";
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
import { listSuratMasukWithMeta } from "@/features/surat/application/agenda-use-cases";
import { formatTanggalIndonesia, SURAT_MASUK_RESOURCE } from "@/features/surat/domain/surat";
import { SuratMasukCreateButton } from "@/features/surat/presentation/components/surat-masuk-create-button";
import { SuratMasukRowActions } from "@/features/surat/presentation/components/surat-masuk-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Surat Masuk",
};

export default async function SuratMasukPage({
  searchParams,
}: PageProps<"/persuratan/surat-masuk">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SURAT_MASUK_RESOURCE, "read")) {
    return <NoAccess title="Surat Masuk" description="Buku agenda surat masuk desa." />;
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const { rows, classifications } = await listSuratMasukWithMeta(search);
  const canManage = hasPermission(user.permissions, SURAT_MASUK_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surat Masuk"
        description="Buku agenda surat yang diterima desa."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Cetak
            </Button>
            {canManage ? <SuratMasukCreateButton classifications={classifications} /> : null}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <Input
              name="q"
              defaultValue={search}
              placeholder="Cari nomor, pengirim, atau isi…"
              className="flex-1 sm:max-w-sm"
              aria-label="Cari surat masuk"
            />
            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/persuratan/surat-masuk">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Agenda</TableHead>
                  <TableHead className="w-36">Diterima</TableHead>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Pengirim</TableHead>
                  <TableHead>Klasifikasi</TableHead>
                  <TableHead>Isi Singkat</TableHead>
                  <TableHead>Disposisi</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 8 : 7} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Inbox className="size-5" />
                        <p className="text-sm">
                          {search ? "Tidak ada surat yang cocok." : "Belum ada surat masuk."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="tabular-nums">{row.agendaNumber || "—"}</TableCell>
                      <TableCell>{formatTanggalIndonesia(row.receivedDate)}</TableCell>
                      <TableCell className="font-medium">
                        {row.letterNumber || "—"}
                        {row.letterDate ? (
                          <span className="block text-xs text-muted-foreground">
                            {formatTanggalIndonesia(row.letterDate)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>{row.sender || "—"}</TableCell>
                      <TableCell>{row.classificationName ?? "—"}</TableCell>
                      <TableCell className="max-w-56 truncate">{row.summary || "—"}</TableCell>
                      <TableCell className="max-w-56 truncate">{row.disposition || "—"}</TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <SuratMasukRowActions surat={row} classifications={classifications} />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">Menampilkan {rows.length} surat masuk.</p>
        </CardContent>
      </Card>
    </div>
  );
}
