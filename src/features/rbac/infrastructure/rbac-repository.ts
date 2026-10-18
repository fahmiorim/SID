import "server-only";

import { eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { modules, rolePermissions, roles } from "@/db/schema";
import type { AccessLevel } from "@/features/rbac/domain/permission";

/** Representasi ringkas sebuah role (`roles`). */
export interface RoleRecord {
  id: number;
  slug: string;
  name: string;
  isSystem: boolean;
}

/** Representasi sebuah modul/resource (`modules`). */
export interface ModuleRecord {
  id: number;
  parentId: number | null;
  slug: string;
  name: string;
  url: string | null;
  icon: string | null;
  sortOrder: number | null;
  isGroup: boolean;
  isHidden: boolean;
  isActive: boolean;
}

const roleColumns = {
  id: roles.id,
  slug: roles.slug,
  name: roles.name,
  isSystem: roles.isSystem,
};

const moduleColumns = {
  id: modules.id,
  parentId: modules.parentId,
  slug: modules.slug,
  name: modules.name,
  url: modules.url,
  icon: modules.icon,
  sortOrder: modules.sortOrder,
  isGroup: modules.isGroup,
  isHidden: modules.isHidden,
  isActive: modules.isActive,
};

export async function findRoleById(roleId: number): Promise<RoleRecord | null> {
  const [row] = await db.select(roleColumns).from(roles).where(eq(roles.id, roleId)).limit(1);
  return row ?? null;
}

export async function listModules(villageId: number | null): Promise<ModuleRecord[]> {
  return db
    .select(moduleColumns)
    .from(modules)
    .where(villageId === null ? isNull(modules.villageId) : eq(modules.villageId, villageId));
}

/** Tingkat akses per modul untuk sebuah role. */
export async function listLevelsByRole(roleId: number): Promise<Map<number, AccessLevel>> {
  const rows = await db
    .select({ moduleId: rolePermissions.moduleId, access: rolePermissions.access })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));

  return new Map(rows.map((row) => [row.moduleId, row.access]));
}

export async function listRoles(): Promise<RoleRecord[]> {
  return db.select(roleColumns).from(roles).orderBy(roles.createdAt, roles.name);
}

export async function getRoleBySlug(slug: string): Promise<RoleRecord | null> {
  const [row] = await db.select(roleColumns).from(roles).where(eq(roles.slug, slug)).limit(1);
  return row ?? null;
}

export async function getRoleById(id: number): Promise<RoleRecord | null> {
  const [row] = await db.select(roleColumns).from(roles).where(eq(roles.id, id)).limit(1);
  return row ?? null;
}

export async function clearRolePermissions(roleId: number): Promise<void> {
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
}

export async function createRole(input: { name: string; slug?: string }): Promise<RoleRecord> {
  const slug = input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-");
  const [inserted] = await db.insert(roles).values({ name: input.name, slug }).$returningId();
  if (!inserted) throw new Error("Gagal membuat role.");
  const role = await getRoleById(inserted.id);
  if (!role) throw new Error("Gagal mengambil role baru.");
  return role;
}

export async function updateRole(
  id: number,
  input: { name: string; slug?: string },
): Promise<void> {
  const updates: Record<string, unknown> = { name: input.name };
  if (input.slug) updates.slug = input.slug;
  await db.update(roles).set(updates).where(eq(roles.id, id));
}

export async function deleteRole(id: number): Promise<void> {
  await db.delete(roles).where(eq(roles.id, id));
}

export async function setRolePermissions(
  roleId: number,
  perms: Array<{ moduleId: number; access: AccessLevel }>,
): Promise<void> {
  await clearRolePermissions(roleId);
  if (perms.length === 0) return;
  await db
    .insert(rolePermissions)
    .values(perms.map((p) => ({ roleId, moduleId: p.moduleId, access: p.access })));
}
