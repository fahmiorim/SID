import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import { listBulananAnak } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function PemantauanAnakPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "read")) {
    return <NoAccess title="Pemantauan Anak" description="Data pemantauan bulanan anak." />;
  }
  const villageId = await resolveVillageId(user);
  const rows = await listBulananAnak(villageId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Pemantauan Anak (Bulanan)" description="Daftar pemantauan anak" />
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">KIA</th>
                <th className="p-2 text-left">Posyandu</th>
                <th className="p-2 text-left">Umur (bln)</th>
                <th className="p-2 text-left">Status Gizi</th>
                <th className="p-2 text-left">BB/TB</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.kiaId}</td>
                  <td className="p-2">{r.posyanduId}</td>
                  <td className="p-2">{r.umurBulan}</td>
                  <td className="p-2">{r.statusGizi}</td>
                  <td className="p-2">
                    {r.beratBadan ?? "-"} / {r.tinggiBadan ?? "-"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={5}>
                    Belum ada data pemantauan anak.
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
