import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { daftarPemilihan } from "@/features/pemilihan/application/pemilihan-use-cases";
import { PEMILIHAN_RESOURCE } from "@/features/pemilihan/domain/pemilihan";
import { PemilihanManager } from "@/features/pemilihan/presentation/components/pemilihan-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Pemilihan Desa" };
export const dynamic = "force-dynamic";

export default async function PemilihanPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PEMILIHAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Pemilihan Desa"
        description="Data pemilihan hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }

  const villageId = await resolveVillageId(user);
  const items = await daftarPemilihan(villageId);
  const canWrite = hasPermission(user.permissions, PEMILIHAN_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, PEMILIHAN_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemilihan Desa"
        description="Kelola data pemilihan desa, tahun, jenis, dan tanggal penyelenggaraan."
      />
      <PemilihanManager items={items} canWrite={canWrite} canManage={canManage} />
    </div>
  );
}
