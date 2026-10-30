import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { daftarKehadiran } from "@/features/kehadiran/application/kehadiran-use-cases";
import { KEHADIRAN_RESOURCE } from "@/features/kehadiran/domain/kehadiran";
import { KehadiranTable } from "@/features/kehadiran/presentation/components/kehadiran-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Kehadiran" };
export const dynamic = "force-dynamic";

export default async function KehadiranPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KEHADIRAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Kehadiran"
        description="Data kehadiran hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }
  const villageId = await resolveVillageId(user);
  const items = await daftarKehadiran(villageId);
  return (
    <div className="space-y-6">
      <PageHeader title="Kehadiran Perangkat" description="Daftar kehadiran perangkat desa" />
      <KehadiranTable items={items} />
    </div>
  );
}
