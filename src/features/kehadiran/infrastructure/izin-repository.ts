import "server-only";

import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import {
  kehadiranIzin,
  kehadiranPengaturan,
  type NewKehadiranIzin,
} from "@/db/schema/kehadiran-izin";
import { residents } from "@/db/schema/resident";

export async function createIzin(data: NewKehadiranIzin): Promise<number> {
  const [row] = await db.insert(kehadiranIzin).values(data).$returningId();
  if (!row) throw new Error("Gagal menyimpan pengajuan izin.");
  return row.id;
}

export async function listIzinWarga(villageId: number, residentId: number) {
  return db
    .select()
    .from(kehadiranIzin)
    .where(and(eq(kehadiranIzin.villageId, villageId), eq(kehadiranIzin.residentId, residentId)))
    .orderBy(desc(kehadiranIzin.tanggalMulai));
}

export async function listIzinAdmin(
  villageId: number,
  opts?: { bulan?: number; tahun?: number; status?: string },
) {
  const conditions = [eq(kehadiranIzin.villageId, villageId)];

  if (opts?.tahun && opts?.bulan) {
    const awal = `${opts.tahun}-${String(opts.bulan).padStart(2, "0")}-01`;
    const akhir = new Date(Date.UTC(opts.tahun, opts.bulan, 0)).toISOString().slice(0, 10);
    conditions.push(gte(kehadiranIzin.tanggalMulai, awal), lte(kehadiranIzin.tanggalMulai, akhir));
  } else if (opts?.tahun) {
    conditions.push(
      gte(kehadiranIzin.tanggalMulai, `${opts.tahun}-01-01`),
      lte(kehadiranIzin.tanggalMulai, `${opts.tahun}-12-31`),
    );
  }

  if (opts?.status) conditions.push(eq(kehadiranIzin.status, opts.status));

  return db
    .select({
      id: kehadiranIzin.id,
      jenis: kehadiranIzin.jenis,
      tanggalMulai: kehadiranIzin.tanggalMulai,
      tanggalSelesai: kehadiranIzin.tanggalSelesai,
      alasan: kehadiranIzin.alasan,
      status: kehadiranIzin.status,
      catatanOperator: kehadiranIzin.catatanOperator,
      namaPemohon: residents.name,
      nikPemohon: residents.nationalId,
    })
    .from(kehadiranIzin)
    .leftJoin(residents, eq(residents.id, kehadiranIzin.residentId))
    .where(and(...conditions))
    .orderBy(desc(kehadiranIzin.tanggalMulai));
}

export async function putuskanIzin(
  villageId: number,
  id: number,
  status: string,
  catatan: string | null,
  actorId: string,
): Promise<void> {
  await db
    .update(kehadiranIzin)
    .set({ status, catatanOperator: catatan, diputuskanOleh: actorId })
    .where(and(eq(kehadiranIzin.villageId, villageId), eq(kehadiranIzin.id, id)));
}

export async function getPengaturanKehadiran(villageId: number) {
  const [row] = await db
    .select()
    .from(kehadiranPengaturan)
    .where(eq(kehadiranPengaturan.villageId, villageId))
    .limit(1);
  return row ?? null;
}

export async function simpanPengaturanKehadiran(data: {
  villageId: number;
  jamMasuk: string;
  jamKeluar: string;
  hariLibur: string;
  diperbaruiOleh: string;
}): Promise<void> {
  const existing = await getPengaturanKehadiran(data.villageId);
  if (existing) {
    await db
      .update(kehadiranPengaturan)
      .set({
        jamMasuk: data.jamMasuk,
        jamKeluar: data.jamKeluar,
        hariLibur: data.hariLibur,
        diperbaruiOleh: data.diperbaruiOleh,
      })
      .where(eq(kehadiranPengaturan.id, existing.id));
    return;
  }
  await db.insert(kehadiranPengaturan).values(data);
}
