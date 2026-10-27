import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { GRUP_KONTAK_RESOURCE } from "@/features/kontak/domain/kontak";
import { listKontak, listKontakGrup } from "@/features/kontak/infrastructure/kontak-repository";
import { GrupKontakTable } from "@/features/kontak/presentation/components/grup-kontak-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function GrupKontakPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, GRUP_KONTAK_RESOURCE, "read")) {
    return <NoAccess title="Grup Kontak" description="Grup kontak untuk pengiriman pesan." />;
  }
  const canManage = hasPermission(user.permissions, GRUP_KONTAK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const [rows, kontakRows] = await Promise.all([listKontakGrup(villageId), listKontak(villageId)]);
  const kontakOptions = kontakRows.map((row) => ({ id: row.id, nama: row.nama }));

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Grup Kontak" description="Pengelompokan kontak" />
      <GrupKontakTable rows={rows} kontakOptions={kontakOptions} canManage={canManage} />
    </div>
  );
}
