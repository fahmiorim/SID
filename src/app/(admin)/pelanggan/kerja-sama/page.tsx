import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { PELANGGAN_RESOURCE } from "@/features/pelanggan/domain/pelanggan";
import { KerjasamaForm } from "@/features/pelanggan/presentation/components/kerjasama-form";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Pendaftaran Kerja Sama" };
export const dynamic = "force-dynamic";

export default async function KerjasamaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PELANGGAN_RESOURCE, "update")) {
    return (
      <NoAccess
        title="Pendaftaran Kerja Sama"
        description="Hanya petugas berwenang yang dapat mengakses pendaftaran kerja sama."
      />
    );
  }

  await resolveVillageId(user);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendaftaran Kerja Sama"
        description="Daftar pelanggan baru dengan unggah dokumen kerjasama"
      />
      <KerjasamaForm />
    </div>
  );
}
