import { PageHeader } from "@/components/layout/page-header";
import { KehadiranTable } from "@/features/kehadiran/presentation/components/kehadiran-table";
import { listKehadiranAction } from "@/features/kehadiran/presentation/kehadiran-actions";

export const metadata = { title: "Daftar Hadir" };

export default async function KehadiranPage() {
  const items = await listKehadiranAction();

  return (
    <div className="space-y-6">
      <PageHeader title="Daftar Hadir" description="Kelola kehadiran perangkat desa" />
      <KehadiranTable items={items} />
    </div>
  );
}
