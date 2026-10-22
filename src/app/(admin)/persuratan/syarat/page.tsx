import { ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
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
import { listSyaratSuratWithMeta } from "@/features/surat/application/master-use-cases";
import { SYARAT_SURAT_RESOURCE } from "@/features/surat/domain/surat";
import { SyaratCreateButton } from "@/features/surat/presentation/components/syarat-create-button";
import { SyaratRowActions } from "@/features/surat/presentation/components/syarat-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Syarat Surat",
};

export default async function SyaratSuratPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SYARAT_SURAT_RESOURCE, "read")) {
    return <NoAccess title="Syarat Surat" description="Master kelengkapan berkas surat desa." />;
  }

  const rows = await listSyaratSuratWithMeta();
  const canManage = hasPermission(user.permissions, SYARAT_SURAT_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syarat Surat"
        description="Master kelengkapan berkas yang dipasang pada jenis surat."
        actions={canManage ? <SyaratCreateButton /> : null}
      />

      <Card>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Urutan</TableHead>
                  <TableHead>Nama Syarat</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5 : 4} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ClipboardCheck className="size-5" />
                        <p className="text-sm">Belum ada syarat surat.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="tabular-nums">{row.sortOrder}</TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.isActive ? "secondary" : "outline"}>
                          {row.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <SyaratRowActions syarat={row} />
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
