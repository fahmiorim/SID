import { Map, Settings, Users } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { verifySession } from "@/lib/dal";

export default async function BerandaPage() {
  const user = await verifySession();
  const desa = await getIdentitas();

  const namaDesa = desa?.namaDesa ?? "Desa";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beranda"
        description={`Selamat datang, ${user.name}. Anda sedang mengelola ${namaDesa}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" />
              Kependudukan
            </CardTitle>
            <CardDescription>Kelola data penduduk & keluarga</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button asChild size="sm" variant="outline">
              <Link href="/penduduk">Buka</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Map className="size-4" />
              Wilayah Administratif
            </CardTitle>
            <CardDescription>Dusun, RW, RT & pembagian wilayah</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button asChild size="sm" variant="outline">
              <Link href="/wilayah">Buka</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="size-4" />
              Pengaturan
            </CardTitle>
            <CardDescription>Identitas desa, pengguna & hak akses</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button asChild size="sm" variant="outline">
              <Link href="/pengaturan/desa">Buka</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fondasi siap dikembangkan</CardTitle>
          <CardDescription>
            Arsitektur bersih (domain/application/infrastructure/presentation), RBAC terpusat,
            autentikasi better-auth, dan Drizzle ORM sudah terpasang.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
