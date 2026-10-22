import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAlbum, listFoto } from "@/features/konten/application/galeri-use-cases";
import { GALERI_RESOURCE } from "@/features/konten/domain/galeri";
import { GaleriDetailManager } from "@/features/konten/presentation/components/galeri-detail-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

export const metadata: Metadata = {
  title: "Kelola Album Galeri",
};

export default async function AlbumGaleriPage({ params }: PageProps<"/konten/galeri/[id]">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, GALERI_RESOURCE, "read")) {
    return (
      <NoAccess title="Kelola Album" description="Anda tidak memiliki izin mengelola galeri." />
    );
  }

  const { id } = await params;
  const albumId = Number(id);
  if (!Number.isInteger(albumId) || albumId <= 0) notFound();

  const album = await getAlbum(albumId).catch((error) => {
    if (isAppError(error) && error.code === "NOT_FOUND") notFound();
    throw error;
  });
  const foto = await listFoto(albumId);
  const canManage = hasPermission(user.permissions, GALERI_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title={album.nama}
        description={album.keterangan ?? "Kelola foto pada album ini."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/konten/galeri">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            {album.aktif ? (
              <Button variant="outline" asChild>
                <Link href={`/desa/galeri/${album.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  Lihat di situs
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-muted-foreground">
            Slug: <code>{album.slug}</code>
          </span>
          <span className="text-muted-foreground tabular-nums">{album.jumlahFoto} foto</span>
          <Badge variant={album.aktif ? "default" : "secondary"}>
            {album.aktif ? "Tampil di situs" : "Nonaktif"}
          </Badge>
          <span className="text-muted-foreground tabular-nums">Urutan album {album.urut}</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <GaleriDetailManager album={album} foto={foto} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
