import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import {
  daftarIzinAdminData,
  pengaturanKehadiranData,
} from "@/features/kehadiran/application/izin-use-cases";
import { KEHADIRAN_RESOURCE } from "@/features/kehadiran/domain/kehadiran";
import { IzinAdminPanel } from "@/features/kehadiran/presentation/components/izin-admin-panel";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Izin & Cuti" };
export const dynamic = "force-dynamic";

export default async function IzinAdminPage({ searchParams }: PageProps<"/kehadiran/izin">) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KEHADIRAN_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Izin & Cuti"
        description="Pengajuan izin hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }

  const params = await searchParams;
  const sekarang = new Date();
  const bulan = Number(params.bulan);
  const tahun = Number(params.tahun);

  const [{ items, rekap }, pengaturan] = await Promise.all([
    daftarIzinAdminData({
      bulan: Number.isInteger(bulan) && bulan >= 1 && bulan <= 12 ? bulan : sekarang.getMonth() + 1,
      tahun: Number.isInteger(tahun) && tahun > 2000 ? tahun : sekarang.getFullYear(),
    }),
    pengaturanKehadiranData(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Izin & Cuti"
        description="Pengajuan izin warga, keputusan operator, dan rekap bulan berjalan."
      />
      <IzinAdminPanel items={items} rekap={rekap} pengaturan={pengaturan} />
    </div>
  );
}
