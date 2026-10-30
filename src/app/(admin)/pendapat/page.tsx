import { FileDown } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  getRekapPendapatUseCase,
  listPendapatUseCase,
} from "@/features/pendapat/application/use-cases";
import { JAWABAN_KEPUASAN, PENDAPAT_RESOURCE } from "@/features/pendapat/domain/pendapat";
import { PendapatRowActions } from "@/features/pendapat/presentation/components/pendapat-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function PendapatPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, PENDAPAT_RESOURCE, "read")) {
    return (
      <NoAccess title="Pendapat Warga" description="Jajak pendapat kepuasan pelayanan desa." />
    );
  }
  const villageId = await resolveVillageId(user);
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const [rekap, result] = await Promise.all([
    getRekapPendapatUseCase(villageId),
    listPendapatUseCase(villageId, page, PAGE_SIZE),
  ]);
  const labelMap = new Map<number, string>(JAWABAN_KEPUASAN.map((j) => [j.value, j.label]));
  const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const canDelete = hasPermission(user.permissions, PENDAPAT_RESOURCE, "delete");

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Pendapat Warga"
        description="Jajak pendapat kepuasan pelayanan"
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <a href="/pendapat/ekspor">
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
          </div>
        }
      />
      <div className="rounded-md border">
        <div className="p-4 font-medium">Rekapitulasi</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Jawaban</th>
                <th className="p-2 text-right">Jumlah</th>
                <th className="p-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {rekap.map((r) => (
                <tr key={r.pilihan} className="border-b">
                  <td className="p-2">{r.label}</td>
                  <td className="p-2 text-right">{r.total}</td>
                  <td className="p-2 text-right">{r.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-md border">
        <div className="p-4 font-medium">Daftar Pendapat ({result.total})</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">Pengguna</th>
                <th className="p-2 text-left">Jawaban</th>
                {canDelete ? <th className="p-2 text-right">Aksi</th> : null}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">
                    {r.createdAt ? new Date(r.createdAt as string).toLocaleString("id-ID") : "-"}
                  </td>
                  <td className="p-2">{r.pengguna ?? "-"}</td>
                  <td className="p-2">{labelMap.get(Number(r.pilihan)) ?? r.pilihan}</td>
                  {canDelete ? (
                    <td className="p-2 text-right">
                      <PendapatRowActions id={r.id} />
                    </td>
                  ) : null}
                </tr>
              ))}
              {result.rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={canDelete ? 4 : 3}>
                    Belum ada pendapat warga.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pageCount > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? "default" : "outline"} size="sm" asChild>
              <Link href={p === 1 ? "/pendapat" : `/pendapat?page=${p}`}>{p}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
