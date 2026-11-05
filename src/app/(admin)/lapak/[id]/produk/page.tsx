import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { daftarProdukLapak } from "@/features/lapak/application/lapak-product-use-cases";
import { ProdukTable } from "@/features/lapak/presentation/components/produk-table";
import { getCurrentUser } from "@/lib/dal";

export const metadata = { title: "Kelola Produk" };

export default async function ProdukLapakPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lapakId = Number(id);
  if (!lapakId) notFound();

  const user = await getCurrentUser();
  if (!user?.villageId) notFound();

  // Perlu memastikan lapak milik desa ini (bisa dicek di repository jika perlu keamanan lebih)
  const items = await daftarProdukLapak(user.villageId, lapakId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Produk Lapak"
        description="Daftar produk yang tersedia di lapak ini"
      />
      <ProdukTable items={items} lapakId={lapakId} />
    </div>
  );
}
