import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { getBerita, getKategoriOptions } from "@/features/konten/application/berita-use-cases";
import { BERITA_RESOURCE } from "@/features/konten/domain/berita";
import { BeritaForm } from "@/features/konten/presentation/components/berita-form";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";
import { isAppError } from "@/lib/errors";

export const metadata: Metadata = {
  title: "Ubah Berita",
};

export default async function BeritaUbahPage({ params }: PageProps<"/konten/berita/[id]">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, BERITA_RESOURCE, "update")) {
    return <NoAccess title="Ubah Berita" description="Anda tidak memiliki izin mengubah berita." />;
  }

  const { id } = await params;
  const beritaId = Number(id);
  if (!Number.isInteger(beritaId) || beritaId <= 0) notFound();

  const berita = await getBerita(beritaId).catch((error) => {
    if (isAppError(error) && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  const kategori = await getKategoriOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ubah Berita"
        description={berita.judul}
        actions={
          <Button variant="outline" asChild>
            <Link href="/konten/berita">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
        }
      />

      <BeritaForm berita={berita} kategori={kategori} />
    </div>
  );
}
