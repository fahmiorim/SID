import "server-only";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";

import { db } from "@/db";
import { verifikasiKontak } from "@/db/schema/verifikasi-kontak";

export async function simpanKodeVerifikasi(data: {
  villageId: number;
  residentId: number;
  target: string;
  kodeHash: string;
  kedaluwarsa: Date;
}): Promise<void> {
  await db
    .delete(verifikasiKontak)
    .where(
      and(
        eq(verifikasiKontak.villageId, data.villageId),
        eq(verifikasiKontak.residentId, data.residentId),
        isNull(verifikasiKontak.terverifikasiAt),
      ),
    );
  await db.insert(verifikasiKontak).values(data);
}

export async function findKodeAktif(villageId: number, residentId: number) {
  const [row] = await db
    .select()
    .from(verifikasiKontak)
    .where(
      and(
        eq(verifikasiKontak.villageId, villageId),
        eq(verifikasiKontak.residentId, residentId),
        isNull(verifikasiKontak.terverifikasiAt),
      ),
    )
    .orderBy(desc(verifikasiKontak.id))
    .limit(1);
  return row ?? null;
}

export async function tandaiKontakTerverifikasi(id: number): Promise<void> {
  await db
    .update(verifikasiKontak)
    .set({ terverifikasiAt: new Date() })
    .where(eq(verifikasiKontak.id, id));
}

export async function getKontakTerverifikasi(
  villageId: number,
  residentId: number,
): Promise<{ target: string } | null> {
  const [row] = await db
    .select({ target: verifikasiKontak.target })
    .from(verifikasiKontak)
    .where(
      and(
        eq(verifikasiKontak.villageId, villageId),
        eq(verifikasiKontak.residentId, residentId),
        isNotNull(verifikasiKontak.terverifikasiAt),
      ),
    )
    .orderBy(desc(verifikasiKontak.id))
    .limit(1);
  return row ?? null;
}
