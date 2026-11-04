import { eq } from "drizzle-orm";

import { db } from "@/db";
import { apiKeys } from "@/db/schema/api-keys";

import { verifyApiKey } from "./api-key";

type ApiKeyRecord = typeof apiKeys.$inferSelect;

export type AuthResult =
  { ok: false; status: number; message: string } | { ok: true; apiKey: ApiKeyRecord };

export async function authenticateApiKey(key: string): Promise<AuthResult> {
  if (!key.startsWith("SID_")) return { ok: false, status: 401, message: "Kunci API tidak valid." };

  const prefix = "SID_";
  const apiKeyRecord = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.prefix, prefix),
  });

  if (!apiKeyRecord) return { ok: false, status: 401, message: "Kunci API tidak valid." };
  if (!apiKeyRecord.active) return { ok: false, status: 403, message: "Kunci API tidak aktif." };

  if (!verifyApiKey(key, apiKeyRecord.hashedKey)) {
    return { ok: false, status: 401, message: "Kunci API tidak valid." };
  }

  return { ok: true, apiKey: apiKeyRecord };
}
