import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import {
  listBulananAnak,
  listKia,
  listPosyandu,
} from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { BulananAnakTable } from "@/features/kesehatan/presentation/components/bulanan-anak-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function PemantauanAnakPage() {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "read")) {
    return <NoAccess title="Pemantauan Anak" description="Data pemantauan bulanan anak." />;
  }
  const canManage = hasPermission(user.permissions, KIA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const [rows, posyanduRows, kiaRows] = await Promise.all([
    listBulananAnak(villageId),
    listPosyandu(villageId),
    listKia(villageId),
  ]);
  const posyanduOptions = posyanduRows.map((row) => ({ id: row.id, label: row.nama }));
  const kiaOptions = kiaRows.map((row) => ({
    id: row.id,
    label: row.ibuName ? `${row.noKia} — ${row.ibuName}` : row.noKia,
  }));

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Pemantauan Anak (Bulanan)" description="Daftar pemantauan anak" />
      <BulananAnakTable
        rows={rows}
        posyanduOptions={posyanduOptions}
        kiaOptions={kiaOptions}
        canManage={canManage}
      />
    </div>
  );
}
