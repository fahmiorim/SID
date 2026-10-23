import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { daftarSliderAdmin } from "@/features/konten/application/slider-use-cases";
import { SLIDER_RESOURCE } from "@/features/konten/domain/slider";
import { SliderManager } from "@/features/konten/presentation/components/slider-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Slider Beranda" };

export default async function SliderPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SLIDER_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Slider Beranda"
        description="Anda tidak memiliki akses untuk mengelola slider beranda."
      />
    );
  }

  const sliders = await daftarSliderAdmin();
  const canWrite = hasPermission(user.permissions, SLIDER_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, SLIDER_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Slider Beranda"
        description="Kelola gambar sorotan yang tampil di beranda situs publik."
      />
      <SliderManager sliders={sliders} canWrite={canWrite} canManage={canManage} />
    </div>
  );
}
