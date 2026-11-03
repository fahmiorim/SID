import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { registrasiWarga, residents, users } from "@/db/schema";

export async function listRegistrasiWarga(villageId: number) {
  return db
    .select()
    .from(registrasiWarga)
    .where(eq(registrasiWarga.villageId, villageId))
    .orderBy(desc(registrasiWarga.createdAt), desc(registrasiWarga.id));
}

export async function findRegistrasiWarga(villageId: number, id: number) {
  const [row] = await db
    .select()
    .from(registrasiWarga)
    .where(and(eq(registrasiWarga.id, id), eq(registrasiWarga.villageId, villageId)))
    .limit(1);
  return row ?? null;
}

export async function findRegistrasiMenunggu(villageId: number, nik: string) {
  const [row] = await db
    .select({ id: registrasiWarga.id })
    .from(registrasiWarga)
    .where(
      and(
        eq(registrasiWarga.villageId, villageId),
        eq(registrasiWarga.nik, nik),
        eq(registrasiWarga.status, "menunggu"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createRegistrasiWarga(input: {
  villageId: number;
  nik: string;
  nama: string;
  noHp: string | null;
}) {
  const [row] = await db
    .insert(registrasiWarga)
    .values({ ...input, status: "menunggu" })
    .$returningId();
  return row?.id ?? 0;
}

export async function updateStatusRegistrasiWarga(villageId: number, id: number, status: string) {
  await db
    .update(registrasiWarga)
    .set({ status })
    .where(and(eq(registrasiWarga.id, id), eq(registrasiWarga.villageId, villageId)));
}

/** Penduduk pemilik NIK pada desa ini (hidup atau bukan). */
export async function findResidentByNik(villageId: number, nik: string) {
  const [row] = await db
    .select({
      id: residents.id,
      name: residents.name,
      nationalId: residents.nationalId,
      lifeStatus: residents.lifeStatus,
    })
    .from(residents)
    .where(and(eq(residents.villageId, villageId), eq(residents.nationalId, nik)))
    .limit(1);
  return row ?? null;
}

export async function hasWargaAccount(villageId: number, residentId: number) {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.villageId, villageId), eq(users.residentId, residentId)))
    .limit(1);
  return Boolean(row);
}
