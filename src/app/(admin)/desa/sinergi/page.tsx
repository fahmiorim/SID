import { FileDown } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { daftarSinergi } from "@/features/sinergi/application/sinergi-use-cases";
import { SINERGI_RESOURCE } from "@/features/sinergi/domain/sinergi";
import { SinergiTable } from "@/features/sinergi/presentation/components/sinergi-table";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Sinergi Program" };
export const dynamic = "force-dynamic";

export default async function SinergiPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, SINERGI_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Sinergi Program"
        description="Pemetaan program lintas pihak hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }

  const canEdit = hasPermission(user.permissions, SINERGI_RESOURCE, "update");
  const canDelete = hasPermission(user.permissions, SINERGI_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  const rows = await daftarSinergi(villageId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sinergi Program"
        description="Pemetaan program lintas pihak dan mitra pembangunan desa"
        actions={
          <Button variant="outline" asChild>
            <a href="/desa/sinergi/ekspor">
              <FileDown className="size-4" />
              Ekspor CSV
            </a>
          </Button>
        }
      />
      <SinergiTable rows={rows} canEdit={canEdit} canDelete={canDelete} />
    </div>
  );
}
