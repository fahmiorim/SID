import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import {
  daftarIndikatorAnalisis,
  daftarKategoriAnalisis,
} from "@/features/analisis/application/analisis-use-cases";
import { ANALISIS_RESOURCE } from "@/features/analisis/domain/analisis";
import { AnalisisManager } from "@/features/analisis/presentation/components/analisis-manager";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Analisis" };
export const dynamic = "force-dynamic";

export default async function AnalisisPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, ANALISIS_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Analisis"
        description="Data analisis hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }

  const villageId = await resolveVillageId(user);
  const [kategori, indikator] = await Promise.all([
    daftarKategoriAnalisis(villageId),
    daftarIndikatorAnalisis(villageId),
  ]);
  const canWrite = hasPermission(user.permissions, ANALISIS_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, ANALISIS_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader title="Analisis" description="Kelola kategori dan indikator analisis desa." />
      <AnalisisManager
        kategori={kategori}
        indikator={indikator}
        canWrite={canWrite}
        canManage={canManage}
      />
    </div>
  );
}
