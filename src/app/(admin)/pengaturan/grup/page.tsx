import { Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
import { hasPermission } from "@/features/rbac/application/authorization";
import { getRoleDetail, listRolesWithMeta } from "@/features/rbac/application/grup-use-cases";
import {
  GRUP_AKSES_RESOURCE,
  type ModulePermissionRow,
  type RoleDTO,
} from "@/features/rbac/domain/grup";
import { PermissionMatrix } from "@/features/rbac/presentation/components/permission-matrix";
import { RoleCreateButton } from "@/features/rbac/presentation/components/role-create-button";
import { RoleRowActions } from "@/features/rbac/presentation/components/role-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Grup & Hak Akses",
};

export default async function GrupPage({ searchParams }: PageProps<"/pengaturan/grup">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, GRUP_AKSES_RESOURCE, "read")) {
    return <NoAccess title="Grup & Hak Akses" description="Kelola grup dan hak akses modul." />;
  }

  const params = await searchParams;
  const roleIdParam = typeof params.role === "string" ? params.role : null;
  const selectedId = roleIdParam ? Number(roleIdParam) : null;

  const roles = await listRolesWithMeta();
  const canManage = hasPermission(user.permissions, GRUP_AKSES_RESOURCE, "update");

  let selected: RoleDTO | null = null;
  let permissions: ModulePermissionRow[] = [];
  if (selectedId && roles.some((r) => r.id === selectedId)) {
    const d = await getRoleDetail(selectedId);
    selected = d.role as RoleDTO;
    permissions = d.permissions;
  } else if (roles.length > 0) {
    const first = roles[0]!;
    const d = await getRoleDetail(first.id);
    selected = d.role as RoleDTO;
    permissions = d.permissions;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grup & Hak Akses"
        description="Kelola grup pengguna dan atur hak akses per modul."
        actions={canManage ? <RoleCreateButton /> : null}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Daftar Grup</h2>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Grup</TableHead>
                    <TableHead className="w-24">Sistem</TableHead>
                    {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 3 : 2} className="h-28 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="size-5" />
                          <p className="text-sm">Belum ada grup akses.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((r) => {
                      const active = selected?.id === r.id;
                      return (
                        <TableRow key={r.id} className={active ? "bg-muted/50" : undefined}>
                          <TableCell className="font-medium">
                            <Button variant="link" className="h-auto p-0 font-medium" asChild>
                              <Link href={`/pengaturan/grup?role=${r.id}`}>{r.name}</Link>
                            </Button>
                          </TableCell>
                          <TableCell>{r.isSystem ? "Ya" : "Tidak"}</TableCell>
                          {canManage ? (
                            <TableCell className="text-right">
                              <RoleRowActions role={r as RoleDTO} />
                            </TableCell>
                          ) : null}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {selected && (
          <PermissionMatrix role={selected} permissions={permissions} canManage={canManage} />
        )}
      </div>
    </div>
  );
}
