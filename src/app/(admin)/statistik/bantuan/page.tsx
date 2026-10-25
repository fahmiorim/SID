import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { getStatistikBantuanUseCase } from "@/features/statistik/application/statistik-use-cases";
import {
  STATISTIK_BANTUAN_LABELS,
  type StatistikBantuanKind,
} from "@/features/statistik/domain/statistik";
import { StatistikTable } from "@/features/statistik/presentation/components/statistik/statistik-table";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function StatistikBantuanPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: StatistikBantuanKind }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.bantuan, "read")) {
    return (
      <NoAccess
        title="Statistik Bantuan"
        description="Rekap peserta bantuan per program atau sasaran."
      />
    );
  }

  const villageId = await resolveVillageId(user);
  const params = await searchParams;
  const kind = (params.kind ?? "program") as StatistikBantuanKind;

  const result = await getStatistikBantuanUseCase(villageId, { kind, perPage: 50 });

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Statistik Bantuan" description={STATISTIK_BANTUAN_LABELS[kind]} />
      <StatistikTable
        rows={result.rows}
        summary={result.summary}
        title={STATISTIK_BANTUAN_LABELS[kind]}
      />
    </div>
  );
}
