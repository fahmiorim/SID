import { FileDown } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { getStatistikPendudukUseCase } from "@/features/statistik/application/statistik-use-cases";
import {
  STATISTIK_LABELS,
  STATISTIK_PENDUDUK_KINDS,
  type StatistikPendudukKind,
} from "@/features/statistik/domain/statistik";
import { StatistikTable } from "@/features/statistik/presentation/components/statistik/statistik-table";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function StatistikPendudukPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: StatistikPendudukKind }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.laporanPenduduk, "read")) {
    return <NoAccess title="Statistik Penduduk" description="Rekap data penduduk per kategori." />;
  }

  const villageId = await resolveVillageId(user);
  const params = await searchParams;
  const kind = (params.kind ?? "gender") as StatistikPendudukKind;

  const result = await getStatistikPendudukUseCase(villageId, { kind, perPage: 50 });

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Statistik Penduduk"
        description={STATISTIK_LABELS[kind]}
        actions={
          <Button variant="outline" asChild>
            <a href={`/statistik/penduduk/ekspor?kind=${kind}`}>
              <FileDown className="size-4" />
              Ekspor CSV
            </a>
          </Button>
        }
      />
      <form method="get" className="flex flex-wrap items-center gap-2">
        <select
          name="kind"
          defaultValue={kind}
          aria-label="Pilih kategori statistik"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        >
          {STATISTIK_PENDUDUK_KINDS.map((value) => (
            <option key={value} value={value}>
              {STATISTIK_LABELS[value]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Tampilkan
        </Button>
      </form>
      <StatistikTable rows={result.rows} summary={result.summary} title={STATISTIK_LABELS[kind]} />
    </div>
  );
}
