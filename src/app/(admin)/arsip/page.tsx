import { PageHeader } from "@/components/layout/page-header";
import {
  listArsipAction,
  listKategoriArsipAction,
} from "@/features/arsip/presentation/arsip-actions";
import { ArsipTable } from "@/features/arsip/presentation/components/arsip-table";

export const metadata = { title: "Arsip Desa" };

export default async function ArsipPage() {
  const [items, kategoriList] = await Promise.all([listArsipAction(), listKategoriArsipAction()]);

  return (
    <div className="space-y-6">
      <PageHeader title="Arsip Desa" description="Pengelolaan arsip dan dokumen desa" />
      <ArsipTable items={items} kategoriList={kategoriList} />
    </div>
  );
}
