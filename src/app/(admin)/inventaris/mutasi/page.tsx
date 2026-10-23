import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { getMutasiPageData } from "@/features/inventaris/application/inventaris-use-cases";
import { MutasiManager } from "@/features/inventaris/presentation/components/mutasi-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export default async function MutasiPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.mutasiInventaris, "read")) {
    return (
      <NoAccess
        title="Mutasi Inventaris"
        description="Anda tidak memiliki akses untuk melihat pengajuan mutasi inventaris."
      />
    );
  }

  const data = await getMutasiPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mutasi Inventaris"
        description="Pengajuan mutasi (pindah/rusak/hapus/perbaikan) dengan persetujuan berjenjang."
      />
      <MutasiManager {...data} today={new Date().toISOString().slice(0, 10)} />
    </div>
  );
}
