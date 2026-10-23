import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { daftarDokumenAdmin } from "@/features/konten/application/dokumen-use-cases";
import { DOKUMEN_RESOURCE } from "@/features/konten/domain/dokumen";
import { DokumenManager } from "@/features/konten/presentation/components/dokumen-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Dokumen Publik" };

export default async function DokumenPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, DOKUMEN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Dokumen Publik"
        description="Anda tidak memiliki akses untuk mengelola dokumen publik."
      />
    );
  }

  const dokumen = await daftarDokumenAdmin();
  const canWrite = hasPermission(user.permissions, DOKUMEN_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, DOKUMEN_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumen Publik"
        description="Kelola dokumen informasi publik dan produk hukum yang dapat diunduh warga."
      />
      <DokumenManager dokumen={dokumen} canWrite={canWrite} canManage={canManage} />
    </div>
  );
}
