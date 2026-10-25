import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listRiwayat } from "@/features/penduduk/application/riwayat-penduduk-use-cases";
import { listPenduduk } from "@/features/penduduk/application/use-cases";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import { MUTATION_TYPES, type MutationType } from "@/features/penduduk/domain/riwayat-penduduk";
import { RiwayatActions } from "@/features/penduduk/presentation/components/riwayat/riwayat-actions";
import { RiwayatFilter } from "@/features/penduduk/presentation/components/riwayat/riwayat-filter";
import { RiwayatTable } from "@/features/penduduk/presentation/components/riwayat/riwayat-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Riwayat Penduduk",
};

const PAGE_SIZE = 20;

function toMutationType(value: string): MutationType | "all" {
  return (MUTATION_TYPES as readonly string[]).includes(value) ? (value as MutationType) : "all";
}

export default async function RiwayatPendudukPage({
  searchParams,
}: PageProps<"/penduduk/riwayat">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PENDUDUK_RESOURCE, "read")) {
    return <NoAccess title="Riwayat Penduduk" description="Catatan mutasi kependudukan desa." />;
  }

  const params = await searchParams;
  const type = toMutationType(typeof params.type === "string" ? params.type : "all");
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  const rawPage = Number(typeof params.page === "string" ? params.page : "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = await listRiwayat({ page, perPage: PAGE_SIZE, type, q, from, to });
  const canManage = hasPermission(user.permissions, PENDUDUK_RESOURCE, "update");
  const pendudukOptions = canManage
    ? (
        await listPenduduk({
          search: "",
          lifeStatus: null,
          page: 1,
          pageSize: 1000,
        })
      ).rows
    : [];

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (type !== "all") query.set("type", type);
    if (q) query.set("q", q);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/penduduk/riwayat?${qs}` : "/penduduk/riwayat";
  };

  const pageCount = Math.max(1, Math.ceil(result.total / result.perPage));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Penduduk"
        description="Catatan kelahiran, kematian, pindah masuk, dan pindah keluar."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/penduduk">
                <ArrowLeft className="size-4" />
                Data Penduduk
              </Link>
            </Button>
            {canManage ? <RiwayatActions pendudukOptions={pendudukOptions} /> : null}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <RiwayatFilter />
          <RiwayatTable rows={result.rows} total={result.total} page={result.page} />

          {pageCount > 1 ? (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" asChild disabled={result.page <= 1}>
                <Link
                  href={pageHref(Math.max(1, result.page - 1))}
                  aria-disabled={result.page <= 1}
                  className={result.page <= 1 ? "pointer-events-none opacity-50" : undefined}
                >
                  Sebelumnya
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {result.page} / {pageCount}
              </span>
              <Button variant="outline" size="sm" asChild disabled={result.page >= pageCount}>
                <Link
                  href={pageHref(Math.min(pageCount, result.page + 1))}
                  aria-disabled={result.page >= pageCount}
                  className={
                    result.page >= pageCount ? "pointer-events-none opacity-50" : undefined
                  }
                >
                  Berikutnya
                </Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
