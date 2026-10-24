import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

/** Catat waktu login terakhir pengguna. */
export async function touchLastLogin(userId: string): Promise<void> {
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
}

/**
 * Status akun yang menentukan tujuan setelah login.
 *
 * Dibaca langsung dari DB (bukan dari cookie) agar `residentId`/`mustChangePin`
 * selalu mutakhir, termasuk setelah operator mereset PIN.
 */
export async function getAccountLoginContext(userId: string): Promise<{
  active: boolean;
  residentId: number | null;
  mustChangePin: boolean;
} | null> {
  const [row] = await db
    .select({
      active: users.active,
      residentId: users.residentId,
      mustChangePin: users.mustChangePin,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row ?? null;
}
