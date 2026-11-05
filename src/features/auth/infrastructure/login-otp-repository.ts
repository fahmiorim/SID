import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { loginOtp } from "@/db/schema/login-otp";

export async function simpanKodeLogin(data: {
  userId: string;
  kanal: string;
  target: string;
  kodeHash: string;
  kedaluwarsa: Date;
}): Promise<void> {
  await db
    .delete(loginOtp)
    .where(and(eq(loginOtp.userId, data.userId), isNull(loginOtp.terpakaiAt)));

  await db.insert(loginOtp).values(data);
}

export async function findKodeLoginAktif(userId: string) {
  const [row] = await db
    .select()
    .from(loginOtp)
    .where(and(eq(loginOtp.userId, userId), isNull(loginOtp.terpakaiAt)))
    .orderBy(desc(loginOtp.id))
    .limit(1);

  return row ?? null;
}

export async function tambahPercobaanLogin(id: number): Promise<void> {
  await db
    .update(loginOtp)
    .set({ percobaan: sql`${loginOtp.percobaan} + 1` })
    .where(eq(loginOtp.id, id));
}

export async function tandaiKodeLoginTerpakai(id: number): Promise<void> {
  await db.update(loginOtp).set({ terpakaiAt: new Date() }).where(eq(loginOtp.id, id));
}
