import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { listMenu } from "@/features/konten/application/menu-use-cases";
import { MENU_RESOURCE } from "@/features/konten/domain/menu";
import { MenuManager } from "@/features/konten/presentation/components/menu-manager";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Menu Navigasi" };

export default async function MenuPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, MENU_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Menu Navigasi"
        description="Anda tidak memiliki akses untuk mengelola menu situs publik."
      />
    );
  }

  const menus = await listMenu();
  const canWrite = hasPermission(user.permissions, MENU_RESOURCE, "update");
  const canManage = hasPermission(user.permissions, MENU_RESOURCE, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Navigasi"
        description="Atur menu yang tampil pada navigasi situs publik desa."
      />
      <MenuManager menus={menus} canWrite={canWrite} canManage={canManage} />
    </div>
  );
}
