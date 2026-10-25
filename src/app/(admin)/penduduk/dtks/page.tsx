import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  getAvailableRtmForDtks,
  getDtksListUseCase,
} from "@/features/penduduk/application/dtks-use-cases";
import { DTKS_RESOURCE } from "@/features/penduduk/domain/dtks";
import { DtksDialog } from "@/features/penduduk/presentation/components/dtks/dtks-dialog";
import { DtksTable } from "@/features/penduduk/presentation/components/dtks/dtks-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "DTKS (Data Terpadu Kesejahteraan Sosial)",
};

const PAGE_SIZE = 20;

export default async function DtksPage({ searchParams }: PageProps<"/penduduk/dtks">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, DTKS_RESOURCE, "read")) {
    return <NoAccess title="DTKS" description="Data Terpadu Kesejahteraan Sosial desa." />;
  }

  const villageId = await resolveVillageId(user);

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = (params.search as string)?.trim() ?? "";
  const status = (params.status as "draf" | "terverifikasi") ?? undefined;
  const dusun = (params.dusun as string)?.trim() ?? "";

  const [result, availableRtm] = await Promise.all([
    getDtksListUseCase(villageId, { page, perPage: PAGE_SIZE, search, status, dusun }),
    getAvailableRtmForDtks(villageId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="DTKS" description="Data Terpadu Kesejahteraan Sosial" />

      <div className="flex items-center justify-between">
        <DtksDialog availableRtm={availableRtm} />
      </div>

      <DtksTable data={result.rows} page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
