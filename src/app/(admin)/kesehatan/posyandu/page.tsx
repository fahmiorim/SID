import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import { listPosyandu } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function KesehatanPosyanduPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "read")) {
    return <NoAccess title="Posyandu" description="Data posyandu desa." />;
  }
  const villageId = await resolveVillageId(user);
  const rows = await listPosyandu(villageId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Posyandu" description="Daftar posyandu" />
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Alamat</th>
                <th className="p-2 text-left">Ketua</th>
                <th className="p-2 text-left">Bidan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.nama}</td>
                  <td className="p-2">{r.alamat ?? "-"}</td>
                  <td className="p-2">{r.namaKetua ?? "-"}</td>
                  <td className="p-2">{r.namaBidan ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={4}>
                    Belum ada data posyandu.
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
