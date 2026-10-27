import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KONTAK_RESOURCE } from "@/features/kontak/domain/kontak";
import { listKontak } from "@/features/kontak/infrastructure/kontak-repository";
import { KontakTable } from "@/features/kontak/presentation/components/kontak-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function DaftarKontakPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KONTAK_RESOURCE, "read")) {
    return <NoAccess title="Daftar Kontak" description="Kontak eksternal untuk hubung warga." />;
  }
  const canManage = hasPermission(user.permissions, KONTAK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const rows = await listKontak(villageId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Daftar Kontak" description="Kontak eksternal" />
      <KontakTable rows={rows} canManage={canManage} />
    </div>
  );
}
