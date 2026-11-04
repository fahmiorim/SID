import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { loadMediaSettings } from "@/features/kebijakan-berkas/presentation/actions";
import { LampiranSettingsTable } from "@/features/kebijakan-berkas/presentation/components/lampiran-settings-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { SURAT_RESOURCE } from "@/features/surat/domain/surat"; // Use the Surat resource for permission
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pengaturan Lampiran",
};

export default async function PengaturanLampiranPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SURAT_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Pengaturan Lampiran"
        description="Kelola batasan MIME, jumlah, dan ukuran unggahan media per kategori."
      />
    );
  }

  const settings = await loadMediaSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Lampiran"
        description="Konfigurasi batasan unggahan berkas per kategori desa."
      />
      <LampiranSettingsTable settings={settings} />
    </div>
  );
}
