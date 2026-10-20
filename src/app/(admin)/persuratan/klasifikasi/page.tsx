import { Tags } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
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
import { listKlasifikasiSurat } from "@/features/surat/application/master-use-cases";
import { KLASIFIKASI_SURAT_RESOURCE } from "@/features/surat/domain/surat";
import { KlasifikasiCreateButton } from "@/features/surat/presentation/components/klasifikasi-create-button";
import { KlasifikasiRowActions } from "@/features/surat/presentation/components/klasifikasi-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Klasifikasi Surat",
};

export default async function KlasifikasiSuratPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KLASIFIKASI_SURAT_RESOURCE, "read")) {
    return <NoAccess title="Klasifikasi Surat" description="Kode klasifikasi surat desa." />;
  }

  const rows = await listKlasifikasiSurat();
  const canManage = hasPermission(user.permissions, KLASIFIKASI_SURAT_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Klasifikasi Surat"
        description="Kode klasifikasi dipakai pada jenis surat dan buku agenda."
        actions={canManage ? <KlasifikasiCreateButton /> : null}
      />

      <Card>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 3 : 2} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Tags className="size-5" />
                        <p className="text-sm">Belum ada klasifikasi.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <KlasifikasiRowActions klasifikasi={row} />
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
