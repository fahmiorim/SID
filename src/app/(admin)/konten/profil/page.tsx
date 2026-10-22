import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { getProfil } from "@/features/konten/application/profil-use-cases";
import { PROFIL_DESA_RESOURCE } from "@/features/konten/domain/profil";
import { ProfilForm } from "@/features/konten/presentation/components/profil-form";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Profil Desa",
};

export default async function ProfilDesaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PROFIL_DESA_RESOURCE, "read")) {
    return (
      <NoAccess title="Profil Desa" description="Kelola visi, misi, sejarah, dan sambutan desa." />
    );
  }

  const profil = await getProfil();
  const canManage = hasPermission(user.permissions, PROFIL_DESA_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Desa"
        description="Isi halaman Profil Desa di situs publik: visi, misi, sejarah, sambutan, dan lokasi kantor."
      />

      <ProfilForm profil={profil} canManage={canManage} />
    </div>
  );
}
