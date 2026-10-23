import "server-only";

import { and, asc, count, desc, eq, like, or } from "drizzle-orm";

import { db } from "@/db";
import { inventaris, inventarisKategori, inventarisMutasi } from "@/db/schema";
import type {
  InventarisInput,
  InventarisKategoriInput,
  InventarisMutasiInput,
  MutasiRow,
} from "@/features/inventaris/domain/inventaris";

export async function listInventarisKategori(villageId: number) {
  return db
    .select()
    .from(inventarisKategori)
    .where(eq(inventarisKategori.villageId, villageId))
    .orderBy(asc(inventarisKategori.kode));
}

export async function createInventarisKategori(villageId: number, input: InventarisKategoriInput) {
  const [row] = await db
    .insert(inventarisKategori)
    .values({ villageId, ...input })
    .$returningId();
  return row?.id;
}

export async function updateInventarisKategori(
  villageId: number,
  id: number,
  input: InventarisKategoriInput,
) {
  await db
    .update(inventarisKategori)
    .set(input)
    .where(and(eq(inventarisKategori.villageId, villageId), eq(inventarisKategori.id, id)));
}

export async function deleteInventarisKategori(villageId: number, id: number) {
  await db
    .delete(inventarisKategori)
    .where(and(eq(inventarisKategori.villageId, villageId), eq(inventarisKategori.id, id)));
}

export async function listInventaris(villageId: number, search = "") {
  const where = and(
    eq(inventaris.villageId, villageId),
    eq(inventaris.isDeleted, false),
    search
      ? or(
          like(inventaris.namaBarang, `%${search}%`),
          like(inventaris.nomorInventaris, `%${search}%`),
          like(inventaris.kodeBarang, `%${search}%`),
        )
      : undefined,
  );

  const [rows, total] = await Promise.all([
    db
      .select({
        id: inventaris.id,
        nomorInventaris: inventaris.nomorInventaris,
        namaBarang: inventaris.namaBarang,
        kodeBarang: inventaris.kodeBarang,
        merk: inventaris.merk,
        tipe: inventaris.tipe,
        jumlah: inventaris.jumlah,
        satuan: inventaris.satuan,
        hargaSatuan: inventaris.hargaSatuan,
        nilaiAkhir: inventaris.nilaiAkhir,
        tahunPembelian: inventaris.tahunPembelian,
        kondisi: inventaris.kondisi,
        lokasi: inventaris.lokasi,
        kategoriNama: inventarisKategori.nama,
        kategoriKode: inventarisKategori.kode,
      })
      .from(inventaris)
      .leftJoin(inventarisKategori, eq(inventaris.kategoriId, inventarisKategori.id))
      .where(where)
      .orderBy(desc(inventaris.createdAt)),
    db.select({ value: count() }).from(inventaris).where(where),
  ]);

  return { rows, total: total[0]?.value ?? 0 };
}

export async function getInventaris(villageId: number, id: number) {
  const [row] = await db
    .select()
    .from(inventaris)
    .where(
      and(
        eq(inventaris.villageId, villageId),
        eq(inventaris.id, id),
        eq(inventaris.isDeleted, false),
      ),
    )
    .limit(1);
  return row;
}

function teksAtauNull(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value.trim() : null;
}

function desimalAtauNull(value: number | undefined): string | null {
  return value === undefined ? null : value.toFixed(2);
}

function nilaiInventaris(input: InventarisInput) {
  return {
    kategoriId: typeof input.kategoriId === "number" ? input.kategoriId : null,
    nomorInventaris: teksAtauNull(input.nomorInventaris),
    namaBarang: input.namaBarang,
    kodeBarang: teksAtauNull(input.kodeBarang),
    merk: teksAtauNull(input.merk),
    tipe: teksAtauNull(input.tipe),
    spesifikasi: teksAtauNull(input.spesifikasi),
    jumlah: input.jumlah.toFixed(2),
    satuan: input.satuan || "buah",
    hargaSatuan: desimalAtauNull(input.hargaSatuan),
    nilaiAkhir:
      input.hargaSatuan === undefined ? null : (input.hargaSatuan * input.jumlah).toFixed(2),
    tahunPembelian: input.tahunPembelian ?? null,
    tanggalPembelian: input.tanggalPembelian || null,
    asal: input.asal ?? null,
    donatur: teksAtauNull(input.donatur),
    kondisi: input.kondisi,
    lokasi: teksAtauNull(input.lokasi),
    keterangan: teksAtauNull(input.keterangan),
  };
}

export async function createInventaris(villageId: number, input: InventarisInput) {
  const [row] = await db
    .insert(inventaris)
    .values({ villageId, ...nilaiInventaris(input) })
    .$returningId();
  return row?.id;
}

export async function updateInventaris(villageId: number, id: number, input: InventarisInput) {
  await db
    .update(inventaris)
    .set(nilaiInventaris(input))
    .where(and(eq(inventaris.villageId, villageId), eq(inventaris.id, id)));
}

export async function softDeleteInventaris(villageId: number, id: number) {
  await db
    .update(inventaris)
    .set({ isDeleted: true, deletedAt: new Date() })
    .where(and(eq(inventaris.villageId, villageId), eq(inventaris.id, id)));
}

export async function listMutasi(villageId: number, inventarisId?: number): Promise<MutasiRow[]> {
  const where = inventarisId
    ? and(
        eq(inventarisMutasi.villageId, villageId),
        eq(inventarisMutasi.inventarisId, inventarisId),
      )
    : eq(inventarisMutasi.villageId, villageId);

  return db
    .select({
      id: inventarisMutasi.id,
      inventarisId: inventarisMutasi.inventarisId,
      jenis: inventarisMutasi.jenis,
      status: inventarisMutasi.status,
      tanggalMutasi: inventarisMutasi.tanggalMutasi,
      lokasiBaru: inventarisMutasi.lokasiBaru,
      kondisiBaru: inventarisMutasi.kondisiBaru,
      jumlahMutasi: inventarisMutasi.jumlahMutasi,
      alasan: inventarisMutasi.alasan,
      namaBarang: inventaris.namaBarang,
      nomorInventaris: inventaris.nomorInventaris,
    })
    .from(inventarisMutasi)
    .leftJoin(inventaris, eq(inventarisMutasi.inventarisId, inventaris.id))
    .where(where)
    .orderBy(desc(inventarisMutasi.createdAt));
}

export async function createMutasi(villageId: number, input: InventarisMutasiInput) {
  const [row] = await db
    .insert(inventarisMutasi)
    .values({
      villageId,
      inventarisId: input.inventarisId,
      jenis: input.jenis,
      tanggalMutasi: input.tanggalMutasi,
      lokasiBaru: teksAtauNull(input.lokasiBaru),
      kondisiBaru: input.kondisiBaru ?? null,
      jumlahMutasi: input.jumlahMutasi.toFixed(2),
      alasan: input.alasan,
      keterangan: teksAtauNull(input.keterangan),
    })
    .$returningId();
  return row?.id;
}

export async function setujuiMutasi(villageId: number, id: number, disetujuiOleh: string) {
  await db
    .update(inventarisMutasi)
    .set({ status: "disetujui", disetujuiOleh, tanggalPersetujuan: new Date() })
    .where(and(eq(inventarisMutasi.villageId, villageId), eq(inventarisMutasi.id, id)));
}

export async function tolakMutasi(villageId: number, id: number, catatanPenolakan: string) {
  await db
    .update(inventarisMutasi)
    .set({ status: "ditolak", catatanPenolakan })
    .where(and(eq(inventarisMutasi.villageId, villageId), eq(inventarisMutasi.id, id)));
}
