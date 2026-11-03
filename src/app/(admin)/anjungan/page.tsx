import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { daftarAnjungan } from "@/features/anjungan/application/anjungan-use-cases";
import { ANJUNGAN_RESOURCE } from "@/features/anjungan/domain/anjungan";
import { AnjunganManager } from "@/features/anjungan/presentation/components/anjungan-manager";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Anjungan Desa" };
export const dynamic = "force-dynamic";

export default async function AnjunganPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, ANJUNGAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Anjungan Desa"
        description="Data anjungan hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }

  const villageId = await resolveVillageId(user);
  const items = await daftarAnjungan(villageId);
  const canWrite = hasPermission(user.permissions, ANJUNGAN_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, ANJUNGAN_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anjungan Desa"
        description="Kelola daftar layanan anjungan mandiri yang tersedia di kantor desa."
      />
      <AnjunganManager items={items} canWrite={canWrite} canManage={canManage} />
    </div>
  );
}
