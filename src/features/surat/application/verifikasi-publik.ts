import "server-only";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { hashVerificationToken, type SuratDetail } from "@/features/surat/domain/surat";
import { findSuratByTokenHash } from "@/features/surat/infrastructure/surat-repository";

/**
 * Use case publik: verifikasi surat via token (Fase 2E — perbaikan IDOR).
 *
 * `villageId` berasal dari host (aturan multi-tenant), token dari URL dicocokkan
 * sebagai hash SHA-256 — bukan PK numerik — sehingga surat tidak dapat ditebak
 * dan tidak pernah bocor lintas desa.
 */
export async function verifikasiSuratPublik(token: string): Promise<{
  desa: Awaited<ReturnType<typeof getIdentitasFromRequest>>;
  surat: SuratDetail | null;
}> {
  const desa = await getIdentitasFromRequest();

  // Token yang tidak berbentuk hex 64 char pasti tidak sah; lewati query.
  if (!/^[0-9a-f]{64}$/i.test(token)) {
    return { desa, surat: null };
  }

  const tokenHash = await hashVerificationToken(token.toLowerCase());
  const surat = await findSuratByTokenHash(desa.id, tokenHash);

  return { desa, surat };
}
