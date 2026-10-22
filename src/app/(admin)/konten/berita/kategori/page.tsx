import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listKategori } from "@/features/konten/application/berita-use-cases";
import { BERITA_KATEGORI_RESOURCE } from "@/features/konten/domain/berita";
import { KategoriManager } from "@/features/konten/presentation/components/kategori-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Kategori Berita",
};

export default async function KategoriBeritaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, BERITA_KATEGORI_RESOURCE, "read")) {
    return <NoAccess title="Kategori Berita" description="Kelola kategori untuk berita desa." />;
  }

  const kategori = await listKategori();
  const canManage = hasPermission(user.permissions, BERITA_KATEGORI_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Berita"
        description="Kelompokkan berita agar pengunjung mudah menyaring konten."
        actions={
          <Button variant="outline" asChild>
            <Link href="/konten/berita">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent>
          <KategoriManager kategori={kategori} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
