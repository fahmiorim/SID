import { Printer, ScrollText } from "lucide-react";
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
import { listSuratDinasWithMeta } from "@/features/surat/application/surat-dinas-use-cases";
import { formatTanggalIndonesia, SURAT_DINAS_RESOURCE } from "@/features/surat/domain/surat";
import { SuratDinasCreateButton } from "@/features/surat/presentation/components/surat-dinas-create-button";
import { SuratDinasRowActions } from "@/features/surat/presentation/components/surat-dinas-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Surat Dinas",
};

export default async function SuratDinasPage({
  searchParams,
}: PageProps<"/persuratan/surat-dinas">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SURAT_DINAS_RESOURCE, "read")) {
    return <NoAccess title="Surat Dinas" description="Buku surat dinas antar instansi." />;
  }

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const { rows, classifications } = await listSuratDinasWithMeta(search);
  const canManage = hasPermission(user.permissions, SURAT_DINAS_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surat Dinas"
        description="Buku surat dinas antar instansi."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Cetak
            </Button>
            {canManage ? <SuratDinasCreateButton classifications={classifications} /> : null}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <Input
              name="q"
              defaultValue={search}
              placeholder="Cari nomor, tujuan, atau perihal…"
              className="flex-1 sm:max-w-sm"
              aria-label="Cari surat dinas"
            />
            <Button type="submit" variant="outline">
              Cari
            </Button>
            {search ? (
              <Button type="button" variant="ghost" asChild>
                <Link href="/persuratan/surat-dinas">Reset</Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Tanggal</TableHead>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Penerima</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead className="w-32">Klasifikasi</TableHead>
                  <TableHead className="w-20">Arsip</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 7 : 6} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ScrollText className="size-5" />
                        <p className="text-sm">
                          {search ? "Tidak ada surat yang cocok." : "Belum ada surat dinas."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{formatTanggalIndonesia(row.letterDate)}</TableCell>
                      <TableCell className="font-medium">{row.letterNumber}</TableCell>
                      <TableCell className="max-w-44 truncate">{row.recipient || "—"}</TableCell>
                      <TableCell className="max-w-56 truncate">{row.subject}</TableCell>
                      <TableCell>{row.classificationName ?? "—"}</TableCell>
                      <TableCell>
                        {row.archiveFile ? (
                          <a
                            className="text-primary underline underline-offset-2"
                            href={`/api/publik/media/${row.archiveFile.replace(/^\/+/, "")}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Berkas
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <SuratDinasRowActions surat={row} classifications={classifications} />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">Menampilkan {rows.length} surat dinas.</p>
        </CardContent>
      </Card>
    </div>
  );
}
