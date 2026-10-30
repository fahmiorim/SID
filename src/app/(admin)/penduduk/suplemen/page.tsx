import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  getSuplemenListUseCase,
  getSuplemenReferencesUseCase,
} from "@/features/penduduk/application/suplemen-use-cases";
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

  const canManage = hasPermission(user.permissions, SUPLEMEN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = (params.search as string)?.trim() ?? "";
  const sasaran = params.sasaran ? Number(params.sasaran) : undefined;

  const [result, references] = await Promise.all([
    getSuplemenListUseCase(villageId, { page, perPage: PAGE_SIZE, search, sasaran }),
    getSuplemenReferencesUseCase(villageId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Data Suplemen" description="Pendataan suplemen penduduk dan keluarga" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {canManage && <SuplemenDialog />}
          <Button variant="outline" asChild>
            <Link href="/penduduk/suplemen/laporan">
              <BarChart3 className="size-4" />
              Laporan
            </Link>
          </Button>
        </div>
        <form method="get" className="flex flex-wrap items-center gap-2">
          <Input
            name="search"
            defaultValue={search}
            placeholder="Cari nama suplemen..."
            className="w-52"
          />
          <select
            name="sasaran"
            defaultValue={sasaran ? String(sasaran) : ""}
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
          >
            <option value="">Semua sasaran</option>
            <option value="1">Penduduk</option>
            <option value="2">Keluarga (KK)</option>
          </select>
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </form>
      </div>

      <SuplemenTable
        data={result.rows}
        page={result.page}
        pageCount={result.pageCount}
        pendudukOptions={references.penduduk}
        keluargaOptions={references.keluarga}
        canManage={canManage}
      />
    </div>
  );
}

// UI suplemen terintegrasi dengan form builder
