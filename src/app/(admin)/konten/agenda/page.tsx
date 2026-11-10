import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { daftarAgendaAdmin } from "@/features/agenda/application/agenda-use-cases";
import { AGENDA_RESOURCE } from "@/features/agenda/domain/agenda";
import { AgendaManager } from "@/features/agenda/presentation/components/agenda-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Agenda Kegiatan" };

export default async function AgendaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, AGENDA_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Agenda Kegiatan"
        description="Anda tidak memiliki akses untuk mengelola agenda kegiatan desa."
      />
    );
  }

  const agenda = await daftarAgendaAdmin();
  const canWrite = hasPermission(user.permissions, AGENDA_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, AGENDA_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda Kegiatan"
        description="Kelola kegiatan desa yang ditampilkan di situs publik. Agenda surat internal tetap berada di buku agenda persuratan."
      />
      <AgendaManager agenda={agenda} canWrite={canWrite} canManage={canManage} />
    </div>
  );
}
