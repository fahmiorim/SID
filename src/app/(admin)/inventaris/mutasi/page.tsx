import { PageHeader } from "@/components/layout/page-header";
import { getMutasiPageData } from "@/features/inventaris/application/inventaris-use-cases";
import { MutasiManager } from "@/features/inventaris/presentation/components/mutasi-manager";

export default async function MutasiPage() {
  const data = await getMutasiPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mutasi Inventaris"
        description="Pengajuan mutasi (pindah/rusak/hapus/perbaikan) dan persetujuannya."
      />
      <MutasiManager {...data} today={new Date().toISOString().slice(0, 10)} />
    </div>
  );
}
