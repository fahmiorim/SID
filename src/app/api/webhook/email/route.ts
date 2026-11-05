import { NextResponse } from "next/server";

import { resolveVillageByHost } from "@/features/desa/application/resolve-village";
import { terimaEmailMasuk } from "@/features/notifikasi/application/mailbox-sms-use-cases";
import { tokenWebhookValid } from "@/features/notifikasi/domain/mailbox-sms";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

function ambilToken(request: Request): string | null {
  const langsung = request.headers.get("x-webhook-token");
  if (langsung) return langsung;
  const auth = request.headers.get("authorization");
  return auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
}

export async function POST(request: Request) {
  if (!tokenWebhookValid(ambilToken(request), env.EMAIL_WEBHOOK_TOKEN)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const desa = await resolveVillageByHost(
      request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    );
    const payload = (await request.json()) as unknown;
    await terimaEmailMasuk(desa.id, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.warn("[webhook/email] Payload ditolak.", {
      error: error instanceof Error ? error.message : "kesalahan tidak diketahui",
    });
    return NextResponse.json({ success: false, error: "Payload tidak valid" }, { status: 400 });
  }
}
