import { BarChart3, FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { getDpt, listElections } from "@/features/penduduk/application/dpt-use-cases";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import { DptFilterWrapper } from "@/features/penduduk/presentation/components/dpt/dpt-filter-wrapper";
import { DptTable } from "@/features/penduduk/presentation/components/dpt/dpt-table";
import { ElectionDialog } from "@/features/penduduk/presentation/components/dpt/election-dialog";
import { PrintButton } from "@/features/penduduk/presentation/components/dpt/print-button";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "DPT (Daftar Pemilih Tetap)",
};

const PAGE_SIZE = 20;

export default async function DptPage({ searchParams }: PageProps<"/penduduk/dpt">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PENDUDUK_RESOURCE, "read")) {
    return <NoAccess title="DPT" description="Daftar Pemilih Tetap desa." />;
  }

  const canManage = hasPermission(user.permissions, PENDUDUK_RESOURCE, "update");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? 1));
  const search = (params.search as string)?.trim() ?? "";
  const dusun = (params.dusun as string)?.trim() ?? "";
  const rw = (params.rw as string)?.trim() ?? "";
  const rt = (params.rt as string)?.trim() ?? "";
  const gender = (params.gender as "male" | "female") ?? "";
  const agamaId = params.agamaId ? Number(params.agamaId) : undefined;
  const pendidikanId = params.pendidikanId ? Number(params.pendidikanId) : undefined;
  const pekerjaanId = params.pekerjaanId ? Number(params.pekerjaanId) : undefined;
  const statusKawinId = params.statusKawinId ? Number(params.statusKawinId) : undefined;
  const umurMin = params.umurMin ? Number(params.umurMin) : undefined;
  const umurMax = params.umurMax ? Number(params.umurMax) : undefined;

  const [elections, result, desa] = await Promise.all([
    canManage ? listElections() : Promise.resolve([]),
    getDpt({
      page,
      perPage: PAGE_SIZE,
      search,
      dusun,
      rw,
      rt,
      gender: gender || undefined,
      agamaId,
      pendidikanId,
      pekerjaanId,
      statusKawinId,
      umurMin,
      umurMax,
    }),
    getIdentitas(),
  ]);

  const activeElection = elections.find((e) => e.status === "aktif");
  const pageCount = Math.max(1, Math.ceil(result.total / result.perPage));

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (dusun) query.set("dusun", dusun);
    if (rw) query.set("rw", rw);
    if (rt) query.set("rt", rt);
    if (gender) query.set("gender", gender);
    if (agamaId) query.set("agamaId", String(agamaId));
    if (pendidikanId) query.set("pendidikanId", String(pendidikanId));
    if (pekerjaanId) query.set("pekerjaanId", String(pekerjaanId));
    if (statusKawinId) query.set("statusKawinId", String(statusKawinId));
    if (umurMin) query.set("umurMin", String(umurMin));
    if (umurMax) query.set("umurMax", String(umurMax));
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/penduduk/dpt?${qs}` : "/penduduk/dpt";
  };

  const exportParams = new URLSearchParams();
  if (search) exportParams.set("search", search);
  if (dusun) exportParams.set("dusun", dusun);
  if (rw) exportParams.set("rw", rw);
  if (rt) exportParams.set("rt", rt);
  if (gender) exportParams.set("gender", gender);
  if (agamaId) exportParams.set("agamaId", String(agamaId));
  if (pendidikanId) exportParams.set("pendidikanId", String(pendidikanId));
  if (pekerjaanId) exportParams.set("pekerjaanId", String(pekerjaanId));
  if (statusKawinId) exportParams.set("statusKawinId", String(statusKawinId));
  if (umurMin) exportParams.set("umurMin", String(umurMin));
  if (umurMax) exportParams.set("umurMax", String(umurMax));
  const exportHref = `/penduduk/dpt/ekspor?${exportParams.toString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="DPT (Daftar Pemilih Tetap)"
        description={
          activeElection
            ? `Daftar pemilih berdasarkan pemilihan aktif (${activeElection.judul}).`
            : `Daftar pemilih berdasarkan pemilihan aktif.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {canManage && (
              <ElectionDialog
                initialElections={elections}
                activeElection={activeElection ?? null}
              />
            )}
            <Button variant="outline" asChild>
              <Link href="/penduduk/dpt/rekap">
                <BarChart3 className="size-4" />
                Rekap
              </Link>
            </Button>
            {activeElection && (
              <>
                <PrintButton />
                <Button variant="outline" asChild>
                  <a href={exportHref}>
                    <FileDown className="size-4" />
                    Ekspor CSV
                  </a>
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Daftar Pemilih Tetap</p>
        <p className="text-sm">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"}
          {desa?.namaKecamatan ? `, Kecamatan ${desa.namaKecamatan}` : ""}
        </p>
        {activeElection && (
          <p className="text-sm">
            {activeElection.judul} &mdash; {activeElection.tanggal}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="print:hidden">
            <DptFilterWrapper
              activeElection={activeElection ?? null}
              defaultParams={{
                search,
                dusun,
                rw,
                rt,
                gender,
                agamaId,
                pendidikanId,
                pekerjaanId,
                statusKawinId,
                umurMin,
                umurMax,
              }}
            />
          </div>
          <DptTable rows={result.rows} total={result.total} page={result.page} />

          {pageCount > 1 && (
            <div className="flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" asChild disabled={result.page <= 1}>
                <Link href={pageHref(Math.max(1, result.page - 1))}>Sebelumnya</Link>
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {result.page} / {pageCount}
              </span>
              <Button variant="outline" size="sm" asChild disabled={result.page >= pageCount}>
                <Link href={pageHref(Math.min(pageCount, result.page + 1))}>Selanjutnya</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
