import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { getSuplemenListUseCase } from "@/features/penduduk/application/suplemen-use-cases";
import { SUPLEMEN_RESOURCE } from "@/features/penduduk/domain/suplemen";
import { SuplemenDialog } from "@/features/penduduk/presentation/components/suplemen/suplemen-dialog";
import { SuplemenTable } from "@/features/penduduk/presentation/components/suplemen/suplemen-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Data Suplemen",
};

const PAGE_SIZE = 20;

export default async function SuplemenPage({ searchParams }: PageProps<"/penduduk/suplemen">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SUPLEMEN_RESOURCE, "read")) {
    return <NoAccess title="Data Suplemen" description="Data suplemen penduduk/keluarga." />;
  }

  const villageId = await resolveVillageId(user);
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = (params.search as string)?.trim() ?? "";
  const sasaran = params.sasaran ? Number(params.sasaran) : undefined;

  const result = await getSuplemenListUseCase(villageId, {
    page,
    perPage: PAGE_SIZE,
    search,
    sasaran,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Data Suplemen" description="Pendataan suplemen penduduk dan keluarga" />

      <div className="flex items-center justify-between">
        <SuplemenDialog />
      </div>

      <SuplemenTable data={result.rows} page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
