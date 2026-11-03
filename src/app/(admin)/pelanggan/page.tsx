import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { PELANGGAN_RESOURCE } from "@/features/pelanggan/domain/pelanggan";
import { PelangganTable } from "@/features/pelanggan/presentation/components/pelanggan-table";
import { listPelangganAction } from "@/features/pelanggan/presentation/pelanggan-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Pelanggan" };
export const dynamic = "force-dynamic";

export default async function PelangganPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PELANGGAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Pelanggan"
        description="Data pelanggan hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }

  await resolveVillageId(user);
  const items = await listPelangganAction();

  return (
    <div className="space-y-6">
      <PageHeader title="Pelanggan" description="Manage customer data kerja sama desa" />
      <PelangganTable items={items} />
    </div>
  );
}
