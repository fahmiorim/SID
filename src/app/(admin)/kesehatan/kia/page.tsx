import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import { listKia, listPosyandu } from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { KiaTable } from "@/features/kesehatan/presentation/components/kia-table";
import { listPendudukOptions } from "@/features/penduduk/infrastructure/penduduk-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function KesehatanKiaPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "read")) {
    return <NoAccess title="Kesehatan Ibu dan Anak" description="Data KIA." />;
  }
  const canManage = hasPermission(user.permissions, KIA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const [rows, pendudukRows, posyanduRows] = await Promise.all([
    listKia(villageId),
    listPendudukOptions(villageId),
    listPosyandu(villageId),
  ]);
  const pendudukOptions = pendudukRows.map((row) => ({
    id: row.id,
    label: row.nationalId ? `${row.name} (${row.nationalId})` : row.name,
  }));
  const posyanduOptions = posyanduRows.map((row) => ({ id: row.id, label: row.nama }));

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Kesehatan Ibu dan Anak (KIA)" description="Daftar KIA" />
      <KiaTable
        rows={rows}
        pendudukOptions={pendudukOptions}
        posyanduOptions={posyanduOptions}
        canManage={canManage}
      />
    </div>
  );
}
