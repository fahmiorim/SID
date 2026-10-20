import { Users } from "lucide-react";
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
import { listPenggunaWithMeta } from "@/features/pengguna/application/pengguna-use-cases";
import { PENGGUNA_RESOURCE } from "@/features/pengguna/domain/pengguna";
import { PenggunaCreateButton } from "@/features/pengguna/presentation/components/pengguna-create-button";
import { PenggunaRowActions } from "@/features/pengguna/presentation/components/pengguna-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pengguna",
};

export default async function PenggunaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PENGGUNA_RESOURCE, "read")) {
    return <NoAccess title="Pengguna" description="Kelola akun pengguna aplikasi." />;
  }

  const { rows, roles, currentUserId } = await listPenggunaWithMeta();
  const canManage = hasPermission(user.permissions, PENGGUNA_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengguna"
        description="Kelola akun, grup akses, dan status pengguna aplikasi."
        actions={canManage ? <PenggunaCreateButton roles={roles} /> : null}
      />

      <Card>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grup Akses</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 6 : 5} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="size-5" />
                        <p className="text-sm">Belum ada pengguna.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.name}
                        {row.id === currentUserId ? (
                          <Badge variant="outline" className="ml-2">
                            Anda
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.username}</TableCell>
                      <TableCell className="text-muted-foreground">{row.email}</TableCell>
                      <TableCell>
                        {row.roleName ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.active ? "secondary" : "outline"}>
                          {row.active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      {canManage ? (
                        <TableCell className="text-right">
                          <PenggunaRowActions
                            pengguna={row}
                            roles={roles}
                            isSelf={row.id === currentUserId}
                          />
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
