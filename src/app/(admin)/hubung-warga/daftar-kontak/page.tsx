import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KONTAK_RESOURCE } from "@/features/kontak/domain/kontak";
import { listKontak } from "@/features/kontak/infrastructure/kontak-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function DaftarKontakPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KONTAK_RESOURCE, "read")) {
    return <NoAccess title="Daftar Kontak" description="Kontak eksternal untuk hubung warga." />;
  }
  const villageId = await resolveVillageId(user);
  const rows = await listKontak(villageId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Daftar Kontak" description="Kontak eksternal" />
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Telepon</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Telegram</th>
                <th className="p-2 text-left">Cara Hubung</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.nama}</td>
                  <td className="p-2">{r.telepon ?? "-"}</td>
                  <td className="p-2">{r.email ?? "-"}</td>
                  <td className="p-2">{r.telegram ?? "-"}</td>
                  <td className="p-2">{r.hubungWarga ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={5}>
                    Belum ada kontak.
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
