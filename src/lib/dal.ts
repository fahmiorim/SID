import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import {
  computeEffectivePermissions,
  hasPermission,
  type EffectivePermissions,
} from "@/features/rbac/application/authorization";
import type { Action } from "@/features/rbac/domain/permission";
import { auth } from "@/lib/auth";
import { forbidden, unauthenticated } from "@/lib/errors";

/** Pengguna yang sedang login beserta role & izin efektifnya. */
export interface CurrentUser {
  id: string;
  name: string;
  username: string | null;
  email: string;
  image: string | null;
  villageId: number | null;
  roleId: number | null;
  permissions: EffectivePermissions;
}

/**
 * Sesi mentah better-auth (di-cache per permintaan).
 *
 * JANGAN dipakai langsung untuk otorisasi; gunakan `getCurrentUser()`.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Ambil pengguna saat ini lengkap dengan izin efektifnya.
 * Mengembalikan `null` bila belum login.
 *
 * Ini adalah satu-satunya pintu resmi untuk mengetahui "siapa yang sedang
 * login" di server. Semua Server Action & Route Handler WAJIB memakainya.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) return null;

  const user = session.user;

  const permissions = await computeEffectivePermissions(
    // `roleId`/`villageId` berasal dari additionalFields better-auth.
    (user.roleId as number | null) ?? 0,
    (user.villageId as number | null) ?? null,
  );

  return {
    id: user.id,
    name: user.name,
    username: (user.username as string | null) ?? null,
    email: user.email,
    image: user.image ?? null,
    villageId: (user.villageId as number | null) ?? null,
    roleId: (user.roleId as number | null) ?? null,
    permissions,
  };
});

/**
 * Pastikan ada pengguna login, jika tidak alihkan ke halaman masuk.
 * Dipakai di Server Component (layout/halaman).
 */
export async function verifySession(redirectTo = "/masuk"): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Ambil pengguna atau lempar `AppError` (untuk Server Action / Route Handler).
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw unauthenticated();
  return user;
}

/**
 * Wajib punya izin `action` atas `resource`; jika tidak, lempar kesalahan.
 *
 * Selalu panggil ini di awal setiap Server Action yang mengubah data — Server
 * Action dapat dipanggil langsung (POST) tanpa melewati UI.
 */
export async function requirePermission(resource: string, action: Action): Promise<CurrentUser> {
  const user = await requireUser();

  if (!hasPermission(user.permissions, resource, action)) {
    throw forbidden();
  }

  return user;
}
