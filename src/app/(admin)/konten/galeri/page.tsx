import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent } from "@/components/ui/card";
import { listAlbum } from "@/features/konten/application/galeri-use-cases";
import { GALERI_RESOURCE } from "@/features/konten/domain/galeri";
import { GaleriAlbumManager } from "@/features/konten/presentation/components/galeri-album-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Galeri Foto",
};

export default async function GaleriPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, GALERI_RESOURCE, "read")) {
    return <NoAccess title="Galeri Foto" description="Kelola album dan foto kegiatan desa." />;
  }

  const album = await listAlbum();
  const canManage = hasPermission(user.permissions, GALERI_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeri Foto"
        description="Kelompokkan foto kegiatan desa ke dalam album dan pilih sorotan untuk beranda."
      />

      <Card>
        <CardContent>
          <GaleriAlbumManager album={album} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
