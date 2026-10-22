import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { getKategoriOptions } from "@/features/konten/application/berita-use-cases";
import { BERITA_RESOURCE } from "@/features/konten/domain/berita";
import { BeritaForm } from "@/features/konten/presentation/components/berita-form";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Tulis Berita",
};

export default async function BeritaBaruPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, BERITA_RESOURCE, "update")) {
    return <NoAccess title="Tulis Berita" description="Anda tidak memiliki izin menulis berita." />;
  }

  const kategori = await getKategoriOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tulis Berita"
        description="Berita berstatus draf tidak tampil di situs publik sampai diterbitkan."
        actions={
          <Button variant="outline" asChild>
            <Link href="/konten/berita">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
        }
      />

      <BeritaForm kategori={kategori} />
    </div>
  );
}
