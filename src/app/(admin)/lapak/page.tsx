import { PageHeader } from "@/components/layout/page-header";
import { LapakTable } from "@/features/lapak/presentation/components/lapak-table";
import {
  listKategoriLapakAction,
  listLapakAction,
} from "@/features/lapak/presentation/lapak-actions";

export const metadata = { title: "Lapak UMKM" };

export default async function LapakPage() {
  const [items, kategoriList] = await Promise.all([listLapakAction(), listKategoriLapakAction()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lapak UMKM"
        description="Kelola data lapak usaha mikro, kecil, dan menengah (UMKM) desa"
      />
      <LapakTable items={items} kategoriList={kategoriList} />
    </div>
  );
}
