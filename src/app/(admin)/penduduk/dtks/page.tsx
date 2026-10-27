import { BarChart3, FileDown, Paperclip, Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  getAvailableRtmForDtks,
  getDtksListUseCase,
} from "@/features/penduduk/application/dtks-use-cases";
import { DTKS_RESOURCE } from "@/features/penduduk/domain/dtks";
import { DtksDialog } from "@/features/penduduk/presentation/components/dtks/dtks-dialog";
import { DtksImportDialog } from "@/features/penduduk/presentation/components/dtks/dtks-import-dialog";
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

  const canManage = hasPermission(user.permissions, DTKS_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = (params.search as string)?.trim() ?? "";
  const statusParam =
    params.status === "draf" || params.status === "terverifikasi" ? params.status : undefined;
  const dusun = (params.dusun as string)?.trim() ?? "";

  const [result, availableRtm] = await Promise.all([
    getDtksListUseCase(villageId, { page, perPage: PAGE_SIZE, search, status: statusParam, dusun }),
    getAvailableRtmForDtks(villageId),
  ]);

  const exportParams = new URLSearchParams();
  if (search) exportParams.set("search", search);
  if (dusun) exportParams.set("dusun", dusun);
  if (statusParam) exportParams.set("status", statusParam);

  return (
    <div className="space-y-6">
      <PageHeader
        title="DTKS"
        description="Data Terpadu Kesejahteraan Sosial"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/penduduk/dtks/laporan">
                <BarChart3 className="size-4" />
                Laporan
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/penduduk/dtks/lampiran">
                <Paperclip className="size-4" />
                Lampiran
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/penduduk/dtks/pengaturan">
                <Settings className="size-4" />
                Program
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={`/penduduk/dtks/ekspor?${exportParams.toString()}`}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            {canManage ? <DtksImportDialog /> : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {canManage && <DtksDialog availableRtm={availableRtm} />}
        <form method="get" className="flex flex-wrap items-center gap-2">
          <Input
            name="search"
            defaultValue={search}
            placeholder="Cari RTM/NIK/nama..."
            className="w-52"
          />
          <Input name="dusun" defaultValue={dusun} placeholder="Dusun" className="w-36" />
          <select
            name="status"
            defaultValue={statusParam ?? ""}
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
          >
            <option value="">Semua status</option>
            <option value="draf">Draf</option>
            <option value="terverifikasi">Terverifikasi</option>
          </select>
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </form>
      </div>

      <DtksTable
        data={result.rows}
        page={result.page}
        pageCount={result.pageCount}
        canManage={canManage}
      />
    </div>
  );
}
