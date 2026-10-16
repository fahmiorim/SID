import type { ReactNode } from "react";

import { hasPermission } from "@/features/rbac/application/authorization";
import type { Resource } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

import { NoAccess } from "./no-access";

/**
 * Gerbang izin untuk halaman modul (Server Component).
 *
 * Halaman tetap **wajib** ada di bawah layout terproteksi; gerbang ini menambah
 * lapisan otorisasi per-modul sehingga pengguna yang tidak berhak tidak dapat
 * membuka modul hanya dengan mengetik URL-nya.
 */
export async function ModuleGuard({
  resource,
  title,
  description,
  children,
}: {
  resource: Resource;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, resource, "read")) {
    return <NoAccess title={title} description={description} />;
  }

  return <>{children}</>;
}
