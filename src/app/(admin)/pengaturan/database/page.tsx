import { Database, Download, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pengaturan Database",
};

export default async function PengaturanDatabasePage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.database, "read")) {
    return (
      <NoAccess title="Pengaturan Database" description="Backup dan restore basis data desa." />
    );
  }

  const canManage = hasPermission(user.permissions, RESOURCES.database, "delete");

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan Database" description="Backup dan restore basis data desa." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup Database
            </CardTitle>
            <CardDescription>Unduh salinan database dalam format SQL atau SQL.GZ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Backup menggunakan mysqldump dengan transaksi tunggal. Simpan berkas hasil backup di
              lokasi terpisah dari server.
            </p>
            {canManage ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href="/api/database/backup?format=gz">Unduh .sql.gz</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/api/database/backup?format=sql">Unduh .sql</a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Anda tidak memiliki izin untuk mengunduh backup.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Restore Database
            </CardTitle>
            <CardDescription>
              Tindakan ini bersifat destruktif dan menggantikan isi database saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-destructive" />
              <p>
                Lakukan backup terlebih dahulu sebelum restore. Hanya pengguna dengan izin kelola
                database yang dapat melakukan tindakan ini.
              </p>
            </div>
            {canManage ? (
              <form
                action="/api/database/restore"
                method="post"
                encType="multipart/form-data"
                className="space-y-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="berkas">Berkas .sql atau .sql.gz</Label>
                  <Input id="berkas" name="berkas" type="file" accept=".sql,.sql.gz" required />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="konfirmasi" value="1" required />
                  Saya mengerti bahwa restore akan menggantikan data saat ini
                </label>
                <Button type="submit" variant="destructive">
                  Pulihkan Database
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                Anda tidak memiliki izin untuk melakukan restore.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
