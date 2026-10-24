import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
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
import { getBumindesDetail } from "@/features/bumindes/presentation/actions";
import { BukuItemCreateButton } from "@/features/bumindes/presentation/components/buku-item-create-button";
import { BukuItemRowActions } from "@/features/bumindes/presentation/components/buku-item-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Buku Administrasi" };

export default async function BukuAdministrasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bukuId = Number(id);

  if (!Number.isInteger(bukuId) || bukuId < 1) notFound();

  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Buku Administrasi" description="Buku administrasi desa." />;
  }

  const detail = await getBumindesDetail(bukuId);
  if (!detail) notFound();

  const { buku, items, nomorUrutBerikutnya } = detail;
  const canWrite = hasPermission(user.permissions, RESOURCES.bumindes, "update");
  const canDelete = hasPermission(user.permissions, RESOURCES.bumindes, "delete");
  const columns = canWrite ? 5 : 4;

  return (
    <div className="space-y-6">
      <PageHeader
        title={buku.namaBuku}
        description={`Kode buku ${buku.kodeBuku}${buku.uraian ? ` · ${buku.uraian}` : ""}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/bumindes/buku-administrasi">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            {canWrite ? (
              <BukuItemCreateButton bukuId={buku.id} nomorUrutAwal={nomorUrutBerikutnya} />
            ) : null}
          </div>
        }
      />

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">No. Urut</TableHead>
                <TableHead className="w-36">Tanggal</TableHead>
                <TableHead>Uraian</TableHead>
                <TableHead>Keterangan</TableHead>
                {canWrite ? <TableHead className="w-16 text-right">Aksi</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns} className="h-24 text-center text-muted-foreground">
                    Belum ada item pada buku ini.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="tabular-nums">{item.nomorUrut}</TableCell>
                    <TableCell>{item.tanggal ?? "-"}</TableCell>
                    <TableCell className="font-medium">{item.uraian}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.keterangan ?? "-"}</TableCell>
                    {canWrite ? (
                      <TableCell className="text-right">
                        <BukuItemRowActions
                          item={item}
                          nomorUrutAwal={nomorUrutBerikutnya}
                          canDelete={canDelete}
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
