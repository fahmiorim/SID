import { FileDown, Printer } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { getStatistikBantuanUseCase } from "@/features/statistik/application/statistik-use-cases";
import {
  STATISTIK_BANTUAN_KINDS,
  STATISTIK_BANTUAN_LABELS,
  type StatistikBantuanKind,
} from "@/features/statistik/domain/statistik";
import { StatistikTable } from "@/features/statistik/presentation/components/statistik/statistik-table";
import { listWilayahOptions } from "@/features/wilayah/infrastructure/wilayah-repository";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

export default async function StatistikBantuanPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: StatistikBantuanKind;
    programSlug?: string;
    dusun?: string;
    rw?: string;
    rt?: string;
    periodeMulai?: string;
    periodeAkhir?: string;
  }>;
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
  const programSlug = params.programSlug;
  const dusun = typeof params.dusun === "string" ? params.dusun : "";
  const rw = typeof params.rw === "string" ? params.rw : "";
  const rt = typeof params.rt === "string" ? params.rt : "";
  const periodeMulai = typeof params.periodeMulai === "string" ? params.periodeMulai : "";
  const periodeAkhir = typeof params.periodeAkhir === "string" ? params.periodeAkhir : "";

  const [result, wilayah] = await Promise.all([
    getStatistikBantuanUseCase(villageId, {
      kind,
      programSlug: programSlug || undefined,
      dusun: dusun || undefined,
      rw: rw || undefined,
      rt: rt || undefined,
      periodeMulai: periodeMulai || undefined,
      periodeAkhir: periodeAkhir || undefined,
      perPage: 50,
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

  const query = new URLSearchParams();
  if (kind !== "program") query.set("kind", kind);
  if (programSlug) query.set("programSlug", programSlug);
  if (dusun) query.set("dusun", dusun);
  if (rw) query.set("rw", rw);
  if (rt) query.set("rt", rt);
  if (periodeMulai) query.set("periodeMulai", periodeMulai);
  if (periodeAkhir) query.set("periodeAkhir", periodeAkhir);
  const exportHref = `/statistik/bantuan/ekspor?${query.toString()}`;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Statistik Bantuan"
        description={STATISTIK_BANTUAN_LABELS[kind]}
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <a href={exportHref}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()}>
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
          aria-label="Pilih jenis statistik bantuan"
          className={SELECT_CLASS}
        >
          {STATISTIK_BANTUAN_KINDS.map((value) => (
            <option key={value} value={value}>
              {STATISTIK_BANTUAN_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          name="dusun"
          defaultValue={dusun}
          aria-label="Saring dusun"
          className={SELECT_CLASS}
        >
          <option value="">Semua dusun</option>
          {dusunOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select name="rw" defaultValue={rw} aria-label="Saring RW" className={SELECT_CLASS}>
          <option value="">Semua RW</option>
          {rwOptions.map((r) => (
            <option key={r} value={r}>
              RW {r}
            </option>
          ))}
        </select>
        <select name="rt" defaultValue={rt} aria-label="Saring RT" className={SELECT_CLASS}>
          <option value="">Semua RT</option>
          {rtOptions.map((r) => (
            <option key={r} value={r}>
              RT {r}
            </option>
          ))}
        </select>
        <Input
          name="periodeMulai"
          type="date"
          defaultValue={periodeMulai}
          aria-label="Periode mulai"
          className="w-40"
        />
        <Input
          name="periodeAkhir"
          type="date"
          defaultValue={periodeAkhir}
          aria-label="Periode akhir"
          className="w-40"
        />
        <Button type="submit" variant="outline">
          Tampilkan
        </Button>
      </form>
      <StatistikTable
        rows={result.rows}
        summary={result.summary}
        title={STATISTIK_BANTUAN_LABELS[kind]}
      />
    </div>
  );
}
