import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { daftarIdm, daftarTahunIdm } from "@/features/idm/application/idm-use-cases";
import { hitungRekapIdm, IDM_RESOURCE } from "@/features/idm/domain/idm";
import { IdmRekap } from "@/features/idm/presentation/components/idm-rekap";
import { IdmTable } from "@/features/idm/presentation/components/idm-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Status Desa / IDM" };
export const dynamic = "force-dynamic";

export default async function IdmPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, IDM_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Status Desa / IDM"
        description="Data IDM hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }

  const params = await searchParams;
  const sekarang = new Date().getFullYear();
  const tahun = Number(params.tahun) || sekarang;
  const villageId = await resolveVillageId(user);

  const [items, tahunTersedia] = await Promise.all([
    daftarIdm(villageId, tahun),
    daftarTahunIdm(villageId),
  ]);
  const rekap = hitungRekapIdm(items);
  const daftarTahun = [...new Set([sekarang, ...tahunTersedia, tahun])].sort((a, b) => b - a);
  const canManage = hasPermission(user.permissions, IDM_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Status Desa / IDM"
        description="Indeks Desa Membangun dan capaian SDGs Desa"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {daftarTahun.map((item) => (
              <Link
                key={item}
                href={`/desa/idm?tahun=${item}`}
                className={`rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors ${
                  item === tahun ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"
                }`}
              >
                {item}
              </Link>
            ))}
            <Link
              href={`/desa/idm-sdgs?tahun=${tahun}`}
              className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent/40"
            >
              Capaian SDGs
            </Link>
          </div>
        }
      />

      <IdmRekap rekap={rekap} />
      <IdmTable items={items} tahun={tahun} canManage={canManage} />
    </div>
  );
}
