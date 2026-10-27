import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import { listPosyandu } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { PosyanduTable } from "@/features/kesehatan/presentation/components/posyandu-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function KesehatanPosyanduPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "read")) {
    return <NoAccess title="Posyandu" description="Data posyandu desa." />;
  }
  const canManage = hasPermission(user.permissions, KIA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const rows = await listPosyandu(villageId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Posyandu" description="Daftar posyandu" />
      <PosyanduTable rows={rows} canManage={canManage} />
    </div>
  );
}
