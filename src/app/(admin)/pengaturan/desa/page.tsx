import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { getIdentitas } from "@/features/desa/application/use-cases";
import { IDENTITAS_DESA_RESOURCE } from "@/features/desa/domain/desa";
import { DesaForm } from "@/features/desa/presentation/components/desa-form";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Identitas Desa",
};

export default async function PengaturanDesaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, IDENTITAS_DESA_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Identitas Desa"
        description="Ubah identitas, alamat, kontak, dan logo desa."
      />
    );
  }

  const desa = await getIdentitas();
  const canManage = hasPermission(user.permissions, IDENTITAS_DESA_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identitas Desa"
        description="Ubah identitas, alamat, kontak, dan logo desa."
      />

      <DesaForm desa={desa} canManage={canManage} />
    </div>
  );
}
