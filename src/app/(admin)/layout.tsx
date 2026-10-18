import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { getMenuForUser } from "@/features/navigation/application/get-menu";
import { findRoleById } from "@/features/rbac/infrastructure/rbac-repository";
import { verifySession } from "@/lib/dal";

/**
 * Layout area terproteksi.
 *
 * `verifySession()` memastikan hanya pengguna login yang dapat merender area ini
 * (proxy hanya melakukan pemeriksaan optimistis). Menu disusun dari izin efektif.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await verifySession();

  const [menu, desa, role] = await Promise.all([
    getMenuForUser(user),
    getIdentitas(),
    user.roleId !== null ? findRoleById(user.roleId) : Promise.resolve(null),
  ]);

  return (
    <AppShell
      menu={menu}
      user={{
        name: user.name,
        username: user.username,
        email: user.email,
        roleName: role?.name ?? null,
      }}
      desa={{ nama: desa?.namaDesa ?? "Desa", logo: desa?.logo ?? null }}
    >
      {children}
    </AppShell>
  );
}
