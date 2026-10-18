import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import { db } from "@/db";
import { APP_NAME } from "@/lib/app-config";
import { env } from "@/lib/env";

/**
 * Instans better-auth (server-only).
 *
 * Keputusan desain:
 * - Tabel identitas memakai nama plural (`users`, `sessions`, `accounts`,
 *   `verifications`) dengan id string yang dikelola better-auth.
 * - Login memakai **username**; email bersifat opsional.
 * - Sesi berlaku 7 hari dan diperpanjang otomatis tiap 1 hari.
 * - `nextCookies()` harus berada di urutan terakhir plugin agar cookie sesi
 *   ikut ter-set ketika autentikasi dipanggil dari Server Action.
 *
 * Catatan: JANGAN impor modul ini dari komponen client. Untuk sisi client,
 * gunakan `@/lib/auth-client`.
 */
export const auth = betterAuth({
  appName: APP_NAME,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, { provider: "mysql", usePlural: true }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 72,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // perpanjang bila sesi dipakai setelah 1 hari
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // cache cookie 5 menit untuk mengurangi query DB
    },
  },

  user: {
    additionalFields: {
      // Nullable untuk mode satu-desa; diisi saat multi-desa aktif.
      villageId: { type: "number", required: false, input: false },
      // FK ke `roles.id` (RBAC).
      roleId: { type: "number", required: false, input: false },
      active: { type: "boolean", required: false, defaultValue: true, input: false },
      lastLoginAt: { type: "date", required: false, input: false },
    },
  },

  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 100,
      usernameValidator: (value) => /^[a-zA-Z0-9._-]+$/.test(value),
    }),
    // WAJIB paling akhir.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
