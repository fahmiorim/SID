import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { totp, users } from "@/db/schema/auth";

export async function simpanKodeTotp(data: {
  userId: string;
  kodeHash: string;
  kedaluwarsa: Date;
}): Promise<void> {
  await db.delete(totp).where(and(eq(totp.userId, data.userId), isNull(totp.terpakaiAt)));

  await db.insert(totp).values(data);
}

export async function findKodeTotpAktif(userId: string) {
  const [row] = await db
    .select()
    .from(totp)
    .where(and(eq(totp.userId, userId), isNull(totp.terpakaiAt)))
    .orderBy(desc(totp.id))
    .limit(1);

  return row ?? null;
}

export async function tambahPercobaanTotp(id: number): Promise<void> {
  await db
    .update(totp)
    .set({ percobaan: sql`${totp.percobaan} + 1` })
    .where(eq(totp.id, id));
}

export async function tandaiKodeTotpTerpakai(id: number): Promise<void> {
  await db.update(totp).set({ terpakaiAt: new Date() }).where(eq(totp.id, id));
}

/** Set atau hapus secret TOTP pengguna. */
export async function setTotpSecret(userId: string, secret: string | null): Promise<void> {
  await db.update(users).set({ totpSecret: secret }).where(eq(users.id, userId));
}

/** Ambil secret TOTP pengguna. */
export async function getTotpSecret(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ totpSecret: users.totpSecret })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.totpSecret ?? null;
}
