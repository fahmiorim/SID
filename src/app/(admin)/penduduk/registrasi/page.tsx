import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import { hasPermission } from "@/features/rbac/application/authorization";
import { daftarRegistrasiWargaData } from "@/features/registrasi-warga/application/registrasi-warga-use-cases";
import { REGISTRASI_WARGA_RESOURCE } from "@/features/registrasi-warga/domain/registrasi-warga";
import { RegistrasiWargaManager } from "@/features/registrasi-warga/presentation/components/registrasi-warga-manager";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Registrasi Akun Warga" };
export const dynamic = "force-dynamic";

export default async function RegistrasiWargaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, REGISTRASI_WARGA_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Registrasi Akun Warga"
        description="Permohonan akun warga hanya dapat dibuka oleh petugas berwenang."
      />
    );
  }

  const items = await daftarRegistrasiWargaData();
  const canApprove =
    hasPermission(user.permissions, REGISTRASI_WARGA_RESOURCE, "update") &&
    hasPermission(user.permissions, PENDUDUK_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrasi Akun Warga"
        description="Periksa permohonan akun layanan mandiri yang diajukan warga lewat situs desa."
      />
      <RegistrasiWargaManager items={items} canApprove={canApprove} />
    </div>
  );
}
