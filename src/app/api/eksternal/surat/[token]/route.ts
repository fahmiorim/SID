import { NextResponse, type NextRequest } from "next/server";

import { authenticateApiKey } from "@/features/api-eksternal/domain/auth";
import { recordAuditEvent } from "@/features/audit/application/audit-use-cases";
import { AUDIT_EVENTS } from "@/features/audit/domain/audit";
import { batasiPermintaan } from "@/features/rate-limit/application/rate-limit";
import { cariSuratEksternal } from "@/features/surat/application/verifikasi-publik";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const apiKeyHeader = req.headers.get("X-API-Key");
  if (!apiKeyHeader) return NextResponse.json({ message: "API Key missing" }, { status: 401 });

  const auth = await authenticateApiKey(apiKeyHeader);
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

  if ((await batasiPermintaan(`api-eksternal:${auth.apiKey.id}`, { batas: 100 })).dibatasi)
    return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 });

  if (!/^[0-9a-f]{64}$/i.test(token))
    return NextResponse.json({ message: "Invalid token format" }, { status: 400 });

  const surat = await cariSuratEksternal(auth.apiKey.villageId, token);

  await recordAuditEvent({
    villageId: auth.apiKey.villageId,
    event: AUDIT_EVENTS.externalSuratGet,
    resource: "surat",
    details: { ditemukan: surat !== null },
  });

  if (!surat) return NextResponse.json({ message: "Surat tidak ditemukan" }, { status: 404 });

  return NextResponse.json({
    surat: {
      id: surat.id,
      nomor: surat.number,
      tanggalTerbit: surat.issuedAt,
      status: surat.status,
    },
  });
}
