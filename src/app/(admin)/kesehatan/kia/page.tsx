import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import { listKia } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function KesehatanKiaPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "read")) {
    return <NoAccess title="Kesehatan Ibu dan Anak" description="Data KIA." />;
  }
  const villageId = await resolveVillageId(user);
  const rows = await listKia(villageId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Kesehatan Ibu dan Anak (KIA)" description="Daftar KIA" />
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">No KIA</th>
                <th className="p-2 text-left">Ibu</th>
                <th className="p-2 text-left">Anak</th>
                <th className="p-2 text-left">HPHT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.noKia}</td>
                  <td className="p-2">{r.ibuName ?? r.ibuId}</td>
                  <td className="p-2">{r.anakId ?? "-"}</td>
                  <td className="p-2">{r.hariPerkiraanLahir ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={4}>
                    Belum ada data KIA.
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
