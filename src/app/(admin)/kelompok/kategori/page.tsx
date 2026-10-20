import { Tags } from "lucide-react";
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
import { listKategoriKelompok } from "@/features/kelompok/application/use-cases";
import { KATEGORI_KELOMPOK_RESOURCE, kelompokTipeLabel } from "@/features/kelompok/domain/kelompok";
import { KategoriCreateButton } from "@/features/kelompok/presentation/components/kategori-create-button";
import { KategoriRowActions } from "@/features/kelompok/presentation/components/kategori-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Kategori Kelompok",
};

export default async function KategoriKelompokPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, KATEGORI_KELOMPOK_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Kategori Kelompok"
        description="Master kategori kelompok dan lembaga desa."
      />
    );
  }

  const rows = await listKategoriKelompok();
  const canManage = hasPermission(user.permissions, KATEGORI_KELOMPOK_RESOURCE, "update");
  const columns = canManage ? 4 : 3;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Kelompok"
        description="Master kategori untuk mengelompokkan kelompok masyarakat dan lembaga desa."
        actions={canManage ? <KategoriCreateButton /> : null}
      />

      <Card>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead className="w-48">Tipe</TableHead>
                  <TableHead className="w-32">Jumlah Kelompok</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Tags className="size-5" />
                        <p className="text-sm">Belum ada kategori.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {kelompokTipeLabel(row.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{row.kelompokCount}</TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <KategoriRowActions kategori={row} />
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
