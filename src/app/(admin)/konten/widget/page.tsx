import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { daftarWidgetAdmin } from "@/features/konten/application/widget-use-cases";
import { WIDGET_RESOURCE } from "@/features/konten/domain/widget";
import { WidgetManager } from "@/features/konten/presentation/components/widget-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Widget" };

export default async function WidgetPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, WIDGET_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Widget"
        description="Anda tidak memiliki akses untuk mengelola widget situs publik."
      />
    );
  }

  const widgets = await daftarWidgetAdmin();
  const canWrite = hasPermission(user.permissions, WIDGET_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, WIDGET_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Widget"
        description="Kelola blok konten yang tampil di samping halaman publik."
      />
      <WidgetManager widgets={widgets} canWrite={canWrite} canManage={canManage} />
    </div>
  );
}
