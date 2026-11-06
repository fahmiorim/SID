import "server-only";

import { desaBaruSchema } from "@/features/multi-desa/domain/desa-baru";
import {
  listDesaSuperAdmin,
  provisionDesa,
  type DesaSuperAdminRow,
} from "@/features/multi-desa/infrastructure/provisioning-repository";
import { getRoleById } from "@/features/rbac/infrastructure/rbac-repository";
import { requireUser, type CurrentUser } from "@/lib/dal";
import { forbidden } from "@/lib/errors";

/** Role yang boleh mengelola daftar desa. */
const ROLE_PENGELOLA = new Set(["administrator", "super-admin"]);

/**
 * Apakah pengguna berhak mengelola desa.
 *
 * `isSuperadmin` mencakup role `administrator` (melewati semua izin), sedangkan
 * role `super-admin` tidak punya `villageId` sehingga tidak dapat dinilai lewat
 * matriks modul — slug role-nya diperiksa langsung.
 */
export async function isSuperAdminUser(user: CurrentUser): Promise<boolean> {
  if (user.permissions.isSuperadmin) return true;
  if (user.roleId === null) return false;

  const role = await getRoleById(user.roleId);
  return role !== null && ROLE_PENGELOLA.has(role.slug);
}

/** Gerbang Server Action/Route Handler pengelolaan desa. */
export async function requireSuperAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!(await isSuperAdminUser(user))) {
    throw forbidden("Hanya super admin yang boleh mengelola desa.");
  }
  return user;
}

/** Daftar desa untuk dashboard super admin. */
export async function daftarDesaSuperAdmin(): Promise<DesaSuperAdminRow[]> {
  await requireSuperAdmin();
  return listDesaSuperAdmin();
}

/**
 * Buat desa baru dari data form.
 *
 * Validasi Zod di sini (bukan hanya di komponen) karena Server Action dapat
 * dipanggil langsung tanpa melewati UI.
 */
export async function buatDesaBaru(input: unknown): Promise<{ id: number }> {
  await requireSuperAdmin();
  const parsed = desaBaruSchema.parse(input);
  return provisionDesa(parsed);
}
