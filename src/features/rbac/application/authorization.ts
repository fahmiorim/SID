import "server-only";

import { cache } from "react";

import {
  aksesToActions,
  applyParentInheritance,
  type Action,
} from "@/features/rbac/domain/permission";
import {
  findRoleById,
  listAksesByRole,
  listModules,
} from "@/features/rbac/infrastructure/rbac-repository";

/**
 * Slug role super admin OpenSID. Role ini melewati seluruh pemeriksaan izin.
 */
export const SUPERADMIN_SLUG = "administrator";

/** Modul bawaan yang selalu dapat diakses setiap pengguna yang sudah masuk. */
export const DEFAULT_RESOURCE = "beranda";

export interface EffectivePermissions {
  isSuperadmin: boolean;
  actionsByResource: Map<string, Set<Action>>;
}

const EMPTY_PERMISSIONS: EffectivePermissions = {
  isSuperadmin: false,
  actionsByResource: new Map(),
};

/**
 * Hitung izin efektif sebuah role, termasuk warisan parent→child.
 *
 * Di-cache per-permintaan memakai `cache()` React sehingga berapa kali pun
 * dipanggil dalam satu render/aksi, query hanya dijalankan sekali.
 */
export const computeEffectivePermissions = cache(
  async (roleId: number, configId: number | null): Promise<EffectivePermissions> => {
    const role = await findRoleById(roleId);

    if (!role) return EMPTY_PERMISSIONS;

    if (role.slug === SUPERADMIN_SLUG) {
      return { isSuperadmin: true, actionsByResource: new Map() };
    }

    const [modules, aksesById] = await Promise.all([
      listModules(configId),
      listAksesByRole(roleId),
    ]);

    const effective = applyParentInheritance(modules, aksesById);
    const actionsByResource = new Map<string, Set<Action>>();

    for (const [slug, akses] of effective) {
      actionsByResource.set(slug, new Set(aksesToActions(akses)));
    }

    return { isSuperadmin: false, actionsByResource };
  },
);

/** Apakah `permissions` mengizinkan `action` atas `resource`. */
export function hasPermission(
  permissions: EffectivePermissions,
  resource: string,
  action: Action,
): boolean {
  if (permissions.isSuperadmin) return true;
  if (resource === DEFAULT_RESOURCE) return action === "read";
  return permissions.actionsByResource.get(resource)?.has(action) ?? false;
}

/** Daftar slug resource yang boleh dibaca (untuk menyusun menu). */
export function readableResources(permissions: EffectivePermissions): Set<string> {
  const slugs = new Set<string>();

  for (const [slug, actions] of permissions.actionsByResource) {
    if (actions.has("read")) slugs.add(slug);
  }

  return slugs;
}
