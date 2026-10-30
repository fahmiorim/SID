import { PageHeader } from "@/components/layout/page-header";
import { SisaLebihTable } from "@/features/keuangan/presentation/components/sisa-lebih-table";
import { listSisaLebihAction } from "@/features/keuangan/presentation/sisa-lebih-actions";

export const metadata = { title: "Sisa Lebih Pembiayaan" };

export default async function SisaLebihPage() {
  const items = await listSisaLebihAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sisa Lebih Pembiayaan"
        description="Pengelolaan SiLPA (Sisa Lebih Pembiayaan)"
      />
      <SisaLebihTable items={items} />
    </div>
  );
}
