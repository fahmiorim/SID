import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { JAWABAN_KEPUASAN, PENDAPAT_RESOURCE } from "@/features/pendapat/domain/pendapat";
import {
  listPendapat,
  rekapPendapat,
} from "@/features/pendapat/infrastructure/pendapat-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function PendapatPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, PENDAPAT_RESOURCE, "read")) {
    return (
      <NoAccess title="Pendapat Warga" description="Jajak pendapat kepuasan pelayanan desa." />
    );
  }
  const villageId = await resolveVillageId(user);
  const [rekap, list] = await Promise.all([rekapPendapat(villageId), listPendapat(villageId, 100)]);
  const labelMap = new Map(JAWABAN_KEPUASAN.map((j) => [j.value, j.label]));

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Pendapat Warga" description="Jajak pendapat kepuasan pelayanan" />
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
        <div className="p-4 font-medium">Daftar Pendapat</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">Pengguna</th>
                <th className="p-2 text-left">Jawaban</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">
                    {r.createdAt ? new Date(r.createdAt as string).toLocaleString("id-ID") : "-"}
                  </td>
                  <td className="p-2">{r.pengguna ?? "-"}</td>
                  <td className="p-2">{labelMap.get(Number(r.pilihan)) ?? r.pilihan}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={3}>
                    Belum ada pendapat warga.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
