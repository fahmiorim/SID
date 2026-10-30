import { FileDown, Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KONTAK_RESOURCE } from "@/features/kontak/domain/kontak";
import { listKontak } from "@/features/kontak/infrastructure/kontak-repository";
import { KontakImporDialog } from "@/features/kontak/presentation/components/kontak-impor-dialog";
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
      <PageHeader
        title="Daftar Kontak"
        description="Kontak eksternal"
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <a href="/hubung-warga/daftar-kontak/ekspor">
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            {canManage ? (
              <KontakImporDialog
                trigger={
                  <Button variant="outline" size="sm">
                    <Upload className="size-4" />
                    Impor CSV
                  </Button>
                }
              />
            ) : null}
          </div>
        }
      />
      <KontakTable rows={rows} canManage={canManage} />
    </div>
  );
}
