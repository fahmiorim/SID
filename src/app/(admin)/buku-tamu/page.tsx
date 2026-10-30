import { PageHeader } from "@/components/layout/page-header";
import { listBukuTamuAction } from "@/features/buku-tamu/presentation/buku-tamu-actions";
import { BukuTamuTable } from "@/features/buku-tamu/presentation/components/buku-tamu-table";

export const metadata = { title: "Buku Tamu" };

export default async function BukuTamuPage() {
  const items = await listBukuTamuAction();

  return (
    <div className="space-y-6">
      <PageHeader title="Buku Tamu" description="Kelola data buku tamu desa" />
      <BukuTamuTable items={items} />
    </div>
  );
}
