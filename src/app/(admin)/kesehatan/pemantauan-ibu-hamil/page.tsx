import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import { listIbuHamil } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function PemantauanIbuHamilPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "read")) {
    return <NoAccess title="Pemantauan Ibu Hamil" description="Data pemantauan ibu hamil." />;
  }
  const villageId = await resolveVillageId(user);
  const rows = await listIbuHamil(villageId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Pemantauan Ibu Hamil" description="Daftar pemantauan ibu hamil" />
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">KIA</th>
                <th className="p-2 text-left">Posyandu</th>
                <th className="p-2 text-left">Status Kehamilan</th>
                <th className="p-2 text-left">Usia Kehamilan</th>
                <th className="p-2 text-left">Tgl Melahirkan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.kiaId}</td>
                  <td className="p-2">{r.posyanduId}</td>
                  <td className="p-2">{r.statusKehamilan ?? "-"}</td>
                  <td className="p-2">{r.usiaKehamilan ?? "-"}</td>
                  <td className="p-2">{r.tanggalMelahirkan ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={5}>
                    Belum ada data pemantauan ibu hamil.
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
