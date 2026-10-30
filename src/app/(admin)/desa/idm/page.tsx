import { PageHeader } from "@/components/layout/page-header";
import { IdmTable } from "@/features/idm/presentation/components/idm-table";
import { listIdmAction } from "@/features/idm/presentation/idm-actions";

export const metadata = { title: "Status Desa / IDM" };

export default async function IdmPage() {
  const tahun = new Date().getFullYear();
  const items = await listIdmAction(tahun);

  return (
    <div className="space-y-6">
      <PageHeader title="Status Desa / IDM" description="Indeks Desa Membangun dan SDGs Desa" />
      <IdmTable items={items} tahun={tahun} />
    </div>
  );
}
