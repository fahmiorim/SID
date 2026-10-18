import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { GRUP_AKSES_RESOURCE, type RoleFormInput } from "@/features/rbac/domain/grup";
import { fromCrudPermissions, toCrudPermissions } from "@/features/rbac/domain/permission";
import {
  createRole,
  deleteRole,
  getRoleById,
  listLevelsByRole,
  listModules,
  listRoles,
  setRolePermissions,
  updateRole,
} from "@/features/rbac/infrastructure/rbac-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

export async function listRolesWithMeta() {
  const user = await requirePermission(GRUP_AKSES_RESOURCE, "read");
  await resolveVillageId(user);
  return listRoles();
}

export async function getRoleDetail(id: number) {
  const user = await requirePermission(GRUP_AKSES_RESOURCE, "read");
  await resolveVillageId(user);

  const role = await getRoleById(id);
  if (!role) throw notFound("Grup akses tidak ditemukan.");

  const modules = await listModules(null);
  const levels = await listLevelsByRole(id);

  const permissions = modules.map((m) => {
    const level = levels.get(m.id) ?? null;
    const crud = toCrudPermissions(level);
    return {
      moduleId: m.id,
      slug: m.slug,
      name: m.name,
      url: m.url,
      icon: m.icon,
      parentId: m.parentId,
      isGroup: m.isGroup,
      isActive: m.isActive,
      read: crud.canRead,
      write: crud.canWrite,
      manage: crud.canManage,
    };
  });

  return { role, permissions };
}

export async function createRoleData(input: RoleFormInput): Promise<{ id: number }> {
  const user = await requirePermission(GRUP_AKSES_RESOURCE, "update");
  await resolveVillageId(user);

  const existing = await listRoles();
  if (existing.some((r) => r.name.toLowerCase() === input.name.toLowerCase())) {
    throw conflict("Nama grup sudah digunakan.");
  }

  const role = await createRole({ name: input.name });
  return { id: role.id };
}

export async function updateRoleData(id: number, input: RoleFormInput): Promise<void> {
  const user = await requirePermission(GRUP_AKSES_RESOURCE, "update");
  await resolveVillageId(user);

  const role = await getRoleById(id);
  if (!role) throw notFound("Grup akses tidak ditemukan.");
  if (role.isSystem) throw conflict("Grup sistem tidak dapat diubah.");

  const existing = await listRoles();
  if (existing.some((r) => r.id !== id && r.name.toLowerCase() === input.name.toLowerCase())) {
    throw conflict("Nama grup sudah digunakan.");
  }

  await updateRole(id, { name: input.name });
}

export async function deleteRoleData(id: number): Promise<void> {
  const user = await requirePermission(GRUP_AKSES_RESOURCE, "delete");
  await resolveVillageId(user);

  const role = await getRoleById(id);
  if (!role) throw notFound("Grup akses tidak ditemukan.");
  if (role.isSystem) throw conflict("Grup sistem tidak dapat dihapus.");

  await deleteRole(id);
}

export async function saveRolePermissions(
  roleId: number,
  perms: Array<{ moduleId: number; read: boolean; write: boolean; manage: boolean }>,
): Promise<void> {
  const user = await requirePermission(GRUP_AKSES_RESOURCE, "update");
  await resolveVillageId(user);

  const role = await getRoleById(roleId);
  if (!role) throw notFound("Grup akses tidak ditemukan.");

  const mapped = perms.map((p) => ({
    moduleId: p.moduleId,
    access: fromCrudPermissions({ canRead: p.read, canWrite: p.write, canManage: p.manage }),
  }));

  await setRolePermissions(roleId, mapped);
}
