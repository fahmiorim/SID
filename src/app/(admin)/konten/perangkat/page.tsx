import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listJabatan,
  listJabatanPilihan,
  listPerangkat,
} from "@/features/konten/application/perangkat-use-cases";
import { PERANGKAT_DESA_RESOURCE } from "@/features/konten/domain/perangkat";
import { JabatanManager } from "@/features/konten/presentation/components/jabatan-manager";
import { PerangkatManager } from "@/features/konten/presentation/components/perangkat-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Perangkat Desa",
};

export default async function PerangkatDesaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PERANGKAT_DESA_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Perangkat Desa"
        description="Kelola aparatur desa, jabatan, dan foto untuk halaman pemerintahan."
      />
    );
  }

  const [perangkat, jabatan, jabatanPilihan] = await Promise.all([
    listPerangkat(),
    listJabatan(),
    listJabatanPilihan(),
  ]);
  const canManage = hasPermission(user.permissions, PERANGKAT_DESA_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perangkat Desa"
        description="Susun SOTK desa: jabatan, aparatur, foto, dan penanda tangan surat."
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Perangkat</CardTitle>
        </CardHeader>
        <CardContent>
          <PerangkatManager perangkat={perangkat} jabatan={jabatanPilihan} canManage={canManage} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Katalog Jabatan</CardTitle>
        </CardHeader>
        <CardContent>
          <JabatanManager jabatan={jabatan} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
