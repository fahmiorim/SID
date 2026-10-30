import { PageHeader } from "@/components/layout/page-header";
import { PelangganTable } from "@/features/pelanggan/presentation/components/pelanggan-table";
import { listPelangganAction } from "@/features/pelanggan/presentation/pelanggan-actions";

export const metadata = { title: "Pelanggan" };

export default async function PelangganPage() {
  const items = await listPelangganAction();

  return (
    <div className="space-y-6">
      <PageHeader title="Pelanggan" description="Kelola data pelanggan kerja sama desa" />
      <PelangganTable items={items} />
    </div>
  );
}
