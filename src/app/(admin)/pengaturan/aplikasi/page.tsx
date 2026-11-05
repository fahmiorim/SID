import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { ambilPengaturanAdmin } from "@/features/pengaturan/application/pengaturan-use-cases";
import { PengaturanAplikasiForm } from "@/features/pengaturan/presentation/components/pengaturan-aplikasi-form";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Pengaturan Aplikasi" };
export const dynamic = "force-dynamic";

export default async function PengaturanAplikasiPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.pengaturan, "read")) {
    return (
      <NoAccess
        title="Pengaturan Aplikasi"
        description="Hanya petugas berwenang yang dapat mengubah pengaturan aplikasi."
      />
    );
  }

  const pengaturan = await ambilPengaturanAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Aplikasi"
        description="Pengaturan web publik dan layanan mandiri yang berlaku untuk desa ini."
      />
      <PengaturanAplikasiForm pengaturan={pengaturan} />
    </div>
  );
}
