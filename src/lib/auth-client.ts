"use client";

import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Klien better-auth untuk komponen client.
 *
 * Utamanya dipakai saat butuh hook reaktif seperti `useSession()`. Untuk
 * login/logout kita lebih memilih Server Action (lihat `src/features/auth`),
 * sehingga sebagian besar alur tidak memerlukan klien ini.
 */
export const authClient = createAuthClient({
  plugins: [usernameClient()],
});

export const { useSession, signOut } = authClient;
