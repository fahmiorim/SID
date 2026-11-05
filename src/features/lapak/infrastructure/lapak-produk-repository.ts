import "server-only";

import { and, desc, eq, like, sql } from "drizzle-orm";

import { db } from "@/db";
import { keranjang, type NewKeranjang } from "@/db/schema/keranjang";
import { lapak } from "@/db/schema/lapak";
import { lapakProduk, type LapakProduk, type NewLapakProduk } from "@/db/schema/lapak-produk";

import type { KeranjangItemDTO } from "../domain/lapak-produk";

/** Daftar produk untuk satu lapak (admin). */
export async function listProdukLapak(
  villageId: number,
  lapakId: number,
  opts?: { q?: string; aktif?: boolean },
): Promise<LapakProduk[]> {
  const where = [eq(lapakProduk.villageId, villageId), eq(lapakProduk.lapakId, lapakId)];
  if (opts?.aktif !== undefined) {
    where.push(eq(lapakProduk.aktif, opts.aktif ? 1 : 0));
  }
  if (opts?.q) {
    where.push(like(lapakProduk.nama, `%${opts.q}%`));
  }

  return db
    .select()
    .from(lapakProduk)
    .where(and(...where))
    .orderBy(desc(lapakProduk.id));
}

/** Daftar produk aktif untuk publik. */
export async function listProdukPublik(
  villageId: number,
  lapakId: number,
  opts?: { q?: string },
): Promise<LapakProduk[]> {
  const where = [
    eq(lapakProduk.villageId, villageId),
    eq(lapakProduk.lapakId, lapakId),
    eq(lapakProduk.aktif, 1),
  ];
  if (opts?.q) {
    where.push(like(lapakProduk.nama, `%${opts.q}%`));
  }

  return db
    .select()
    .from(lapakProduk)
    .where(and(...where))
    .orderBy(desc(lapakProduk.id));
}

/** Temukan satu produk. */
export async function findProdukLapak(
  id: number,
  villageId: number,
  lapakId: number,
): Promise<LapakProduk | null> {
  const produk = await db.query.lapakProduk.findFirst({
    where: and(
      eq(lapakProduk.id, id),
      eq(lapakProduk.villageId, villageId),
      eq(lapakProduk.lapakId, lapakId),
    ),
  });
  return produk ?? null;
}

/** Buat produk baru. */
export async function createProdukLapak(data: NewLapakProduk): Promise<number> {
  const result = await db.insert(lapakProduk).values(data).$returningId();
  return result[0]?.id ?? 0;
}

/** Update produk. */
export async function updateProdukLapak(
  id: number,
  villageId: number,
  lapakId: number,
  data: Partial<NewLapakProduk>,
): Promise<void> {
  await db
    .update(lapakProduk)
    .set(data)
    .where(
      and(
        eq(lapakProduk.id, id),
        eq(lapakProduk.villageId, villageId),
        eq(lapakProduk.lapakId, lapakId),
      ),
    );
}

/** Hapus produk. */
export async function deleteProdukLapak(
  id: number,
  villageId: number,
  lapakId: number,
): Promise<void> {
  await db
    .delete(lapakProduk)
    .where(
      and(
        eq(lapakProduk.id, id),
        eq(lapakProduk.villageId, villageId),
        eq(lapakProduk.lapakId, lapakId),
      ),
    );
}

/** Produk dengan koordinat untuk peta. */
export async function listProdukDenganKoordinat(
  villageId: number,
): Promise<(LapakProduk & { lapakNama: string | null })[]> {
  const items = await db
    .select({
      id: lapakProduk.id,
      villageId: lapakProduk.villageId,
      lapakId: lapakProduk.lapakId,
      nama: lapakProduk.nama,
      deskripsi: lapakProduk.deskripsi,
      harga: lapakProduk.harga,
      stok: lapakProduk.stok,
      gambar: lapakProduk.gambar,
      aktif: lapakProduk.aktif,
      latitude: lapakProduk.latitude,
      longitude: lapakProduk.longitude,
      lapakNama: lapak.nama,
    })
    .from(lapakProduk)
    .leftJoin(lapak, eq(lapak.id, lapakProduk.lapakId))
    .where(and(eq(lapakProduk.villageId, villageId), eq(lapakProduk.aktif, 1)));

  return items;
}

/** --- Keranjang Belanja --- */

/** Dapatkan keranjang berdasarkan sessionKey, dibatasi pada satu desa. */
export async function getKeranjangBySession(
  sessionKey: string,
  villageId: number,
  lapakId?: number,
): Promise<KeranjangItemDTO[]> {
  const where = [eq(keranjang.sessionKey, sessionKey), eq(lapakProduk.villageId, villageId)];
  if (lapakId) {
    where.push(eq(keranjang.lapakId, lapakId));
  }

  return db
    .select({
      id: keranjang.id,
      lapakId: keranjang.lapakId,
      produkId: keranjang.produkId,
      jumlah: keranjang.jumlah,
      produkNama: lapakProduk.nama,
      produkHarga: lapakProduk.harga,
      produkGambar: lapakProduk.gambar,
    })
    .from(keranjang)
    .innerJoin(lapakProduk, eq(lapakProduk.id, keranjang.produkId))
    .where(and(...where));
}

/** Tambah item ke keranjang. */
export async function tambahKeranjang(data: NewKeranjang): Promise<number> {
  const result = await db.insert(keranjang).values(data).$returningId();
  return result[0]?.id ?? 0;
}

/** Update jumlah item keranjang. */
export async function updateKeranjangJumlah(
  id: number,
  sessionKey: string,
  jumlah: number,
): Promise<void> {
  await db
    .update(keranjang)
    .set({ jumlah })
    .where(and(eq(keranjang.id, id), eq(keranjang.sessionKey, sessionKey)));
}

/** Hapus item dari keranjang. */
export async function hapusKeranjangItem(id: number, sessionKey: string): Promise<void> {
  await db.delete(keranjang).where(and(eq(keranjang.id, id), eq(keranjang.sessionKey, sessionKey)));
}

/** Kosongkan keranjang untuk session. */
export async function kosongkanKeranjang(sessionKey: string): Promise<void> {
  await db.delete(keranjang).where(eq(keranjang.sessionKey, sessionKey));
}

/** Hitung total item di keranjang. */
export async function hitungTotalKeranjang(sessionKey: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(keranjang)
    .where(eq(keranjang.sessionKey, sessionKey));
  return row?.count ?? 0;
}
