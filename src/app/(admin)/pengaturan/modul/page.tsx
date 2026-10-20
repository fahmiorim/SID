import { Boxes } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

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
import { listModulWithMeta } from "@/features/modul/application/modul-use-cases";
import { MODUL_RESOURCE, parentModulOptions, type ModulDTO } from "@/features/modul/domain/modul";
import { ModulCreateButton } from "@/features/modul/presentation/components/modul-create-button";
import { ModulRowActions } from "@/features/modul/presentation/components/modul-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Modul",
};

export default async function ModulPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, MODUL_RESOURCE, "read")) {
    return <NoAccess title="Modul" description="Kelola katalog modul aplikasi." />;
  }

  const moduls = await listModulWithMeta();
  const canManage = hasPermission(user.permissions, MODUL_RESOURCE, "update");

  const parents = parentModulOptions(moduls);

  const roots = moduls.filter((m: ModulDTO) => m.parentId === null);
  const childrenOf = (id: number) => moduls.filter((m: ModulDTO) => m.parentId === id);

  function renderRows(): ReactNode[] {
    const rows: React.ReactNode[] = [];
    for (const root of roots) {
      rows.push(
        <TableRow key={root.id}>
          <TableCell className="font-medium">{root.name}</TableCell>
          <TableCell className="text-muted-foreground">{root.slug}</TableCell>
          <TableCell>{root.isGroup ? "Ya" : "Tidak"}</TableCell>
          <TableCell>
            <Badge variant={root.isActive ? "secondary" : "outline"}>
              {root.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </TableCell>
          {canManage ? (
            <TableCell className="text-right">
              <ModulRowActions modul={root} parents={parents} canManage={canManage} />
            </TableCell>
          ) : null}
        </TableRow>,
      );
      for (const child of childrenOf(root.id)) {
        rows.push(
          <TableRow key={child.id}>
            <TableCell className="pl-8">
              <span className="mr-2 text-muted-foreground">└</span>
              {child.name}
            </TableCell>
            <TableCell className="text-muted-foreground">{child.slug}</TableCell>
            <TableCell>{child.isGroup ? "Ya" : "Tidak"}</TableCell>
            <TableCell>
              <Badge variant={child.isActive ? "secondary" : "outline"}>
                {child.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </TableCell>
            {canManage ? (
              <TableCell className="text-right">
                <ModulRowActions modul={child} parents={parents} canManage={canManage} />
              </TableCell>
            ) : null}
          </TableRow>,
        );
      }
    }
    return rows;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modul"
        description="Kelola katalog modul aplikasi (menu & resource izin)."
        actions={canManage ? <ModulCreateButton parents={parents} /> : null}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Modul</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-24">Grup</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {moduls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5 : 4} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Boxes className="size-5" />
                        <p className="text-sm">Belum ada modul.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  renderRows()
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
