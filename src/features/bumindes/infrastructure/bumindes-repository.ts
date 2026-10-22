import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { bumindesBuku, bumindesItem } from "@/db/schema";
import { notFound } from "@/lib/errors";

const DEFAULT_BUKU = [
  { kodeBuku: "A1", namaBuku: "Buku Peraturan Desa" },
  { kodeBuku: "A2", namaBuku: "Buku Keputusan Kepala Desa" },
  { kodeBuku: "A3", namaBuku: "Buku Inventaris dan Kekayaan Desa" },
  { kodeBuku: "B1", namaBuku: "Buku Tanah Kas Desa" },
  { kodeBuku: "B2", namaBuku: "Buku Tanah di Desa" },
  { kodeBuku: "C1", namaBuku: "Buku Agenda" },
  { kodeBuku: "C2", namaBuku: "Buku Ekspedisi" },
  { kodeBuku: "D1", namaBuku: "Buku Pemberian Tanda Tangan dan Cap Desa" },
];

export async function seedBumindesBuku(villageId: number) {
  const existing = await db
    .select()
    .from(bumindesBuku)
    .where(eq(bumindesBuku.villageId, villageId));
  if (existing.length > 0) return;
  await db.insert(bumindesBuku).values(DEFAULT_BUKU.map((b) => ({ villageId, ...b })));
}

export async function ensureBumindesBuku(villageId: number) {
  await seedBumindesBuku(villageId);
  return db
    .select()
    .from(bumindesBuku)
    .where(eq(bumindesBuku.villageId, villageId))
    .orderBy(asc(bumindesBuku.kodeBuku));
}

export async function getBumindesBuku(villageId: number, bukuId: number) {
  const [buku] = await db
    .select()
    .from(bumindesBuku)
    .where(and(eq(bumindesBuku.villageId, villageId), eq(bumindesBuku.id, bukuId)))
    .limit(1);
  return buku ?? null;
}

export async function listBumindesItem(villageId: number, bukuId: number) {
  return db
    .select()
    .from(bumindesItem)
    .where(and(eq(bumindesItem.villageId, villageId), eq(bumindesItem.bukuId, bukuId)))
    .orderBy(asc(bumindesItem.nomorUrut), asc(bumindesItem.id));
}

export async function tambahItemBumindes(
  villageId: number,
  input: {
    bukuId: number;
    nomorUrut: number;
    tanggal: string | null;
    uraian: string;
    keterangan: string | null;
  },
) {
  const buku = await getBumindesBuku(villageId, input.bukuId);
  if (!buku) throw notFound("Buku administrasi tidak ditemukan.");

  const [row] = await db
    .insert(bumindesItem)
    .values({
      villageId,
      bukuId: input.bukuId,
      nomorUrut: input.nomorUrut,
      tanggal: input.tanggal,
      uraian: input.uraian,
      keterangan: input.keterangan,
    })
    .$returningId();

  return row?.id;
}
