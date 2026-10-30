import { FileDown, Printer } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { listWilayahOptions } from "@/features/wilayah/infrastructure/wilayah-repository";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function StatistikPendudukPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    dusun?: string;
    rw?: string;
    rt?: string;
    umurMin?: string;
    umurMax?: string;
    page?: string;
  }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, RESOURCES.laporanPenduduk, "read")) {
    return <NoAccess title="Statistik Penduduk" description="Rekap data penduduk per kategori." />;
  }

  const villageId = await resolveVillageId(user);
  const params = await searchParams;
  const kind = (params.kind ?? "gender") as StatistikPendudukKind;
  const dusun = typeof params.dusun === "string" ? params.dusun : "";
  const rw = typeof params.rw === "string" ? params.rw : "";
  const rt = typeof params.rt === "string" ? params.rt : "";
  const umurMin =
    typeof params.umurMin === "string" && params.umurMin !== ""
      ? Number(params.umurMin)
      : undefined;
  const umurMax =
    typeof params.umurMax === "string" && params.umurMax !== ""
      ? Number(params.umurMax)
      : undefined;

  const [result, wilayah] = await Promise.all([
    getStatistikPendudukUseCase(villageId, {
      kind,
      dusun,
      rw,
      rt,
      umurMin,
      umurMax,
      perPage: PAGE_SIZE,
    }),
    listWilayahOptions(villageId),
  ]);

  const dusunOptions = [...new Set(wilayah.map((w) => w.dusun).filter(Boolean))].sort();
  const rwOptions = [...new Set(wilayah.map((w) => w.rw).filter(Boolean))].sort(
    (a, b) => Number(a) - Number(b),
  );
  const rtOptions = [...new Set(wilayah.map((w) => w.rt).filter(Boolean))].sort(
    (a, b) => Number(a) - Number(b),
  );

  const queryBase = new URLSearchParams();
  if (kind !== "gender") queryBase.set("kind", kind);
  if (dusun) queryBase.set("dusun", dusun);
  if (rw) queryBase.set("rw", rw);
  if (rt) queryBase.set("rt", rt);
  if (umurMin !== undefined) queryBase.set("umurMin", String(umurMin));
  if (umurMax !== undefined) queryBase.set("umurMax", String(umurMax));
  const exportHref = `/statistik/penduduk/ekspor?${queryBase.toString()}`;
  const exportPdfHref = `/statistik/penduduk/ekspor/pdf?${queryBase.toString()}`;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Statistik Penduduk"
        description={STATISTIK_LABELS[kind]}
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <a href={exportPdfHref}>
                <FileDown className="size-4" />
                Ekspor PDF
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => typeof window !== "undefined" && window.print()}
            >
              <Printer className="size-4" />
              Cetak
            </Button>
            <Button variant="outline" asChild>
              <a href={exportHref}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <Button type="button" variant="outline" onClick={() => (window as Window).print()}>
              <Printer className="size-4" />
              Cetak
            </Button>
          </div>
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
        <select
          name="dusun"
          defaultValue={dusun}
          aria-label="Saring dusun"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        >
          <option value="">Semua dusun</option>
          {dusunOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          name="rw"
          defaultValue={rw}
          aria-label="Saring RW"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        >
          <option value="">Semua RW</option>
          {rwOptions.map((r) => (
            <option key={r} value={r}>
              RW {r}
            </option>
          ))}
        </select>
        <select
          name="rt"
          defaultValue={rt}
          aria-label="Saring RT"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        >
          <option value="">Semua RT</option>
          {rtOptions.map((r) => (
            <option key={r} value={r}>
              RT {r}
            </option>
          ))}
        </select>
        <Input
          name="umurMin"
          type="number"
          min={0}
          defaultValue={umurMin ?? ""}
          placeholder="Umur min"
          aria-label="Umur minimal"
          className="w-24"
        />
        <Input
          name="umurMax"
          type="number"
          min={0}
          defaultValue={umurMax ?? ""}
          placeholder="Umur max"
          aria-label="Umur maksimal"
          className="w-24"
        />
        <Button type="submit" variant="outline">
          Tampilkan
        </Button>
      </form>
      <StatistikTable rows={result.rows} summary={result.summary} title={STATISTIK_LABELS[kind]} />
    </div>
  );
}
