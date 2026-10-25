import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { GRUP_KONTAK_RESOURCE } from "@/features/kontak/domain/kontak";
import { listKontakGrup } from "@/features/kontak/infrastructure/kontak-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function GrupKontakPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, GRUP_KONTAK_RESOURCE, "read")) {
    return <NoAccess title="Grup Kontak" description="Grup kontak untuk pengiriman pesan." />;
  }
  const villageId = await resolveVillageId(user);
  const rows = await listKontakGrup(villageId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Grup Kontak" description="Pengelompokan kontak" />
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Nama Grup</th>
                <th className="p-2 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.namaGrup}</td>
                  <td className="p-2">{r.keterangan ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={2}>
                    Belum ada grup kontak.
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
