import "server-only";

import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { jabatanPerangkat, perangkatDesa } from "@/db/schema";

import type { JabatanAdminRow, JabatanOption, PerangkatAdmin } from "../domain/perangkat";

/**
 * Akses data jabatan & perangkat desa (Fase 1F.4).
 *
 * Semua query membawa `villageId` dari sesi. Jabatan dihapus tanpa menghapus
 * perangkat: FK `jabatan_id` memakai `set null`, sehingga orangnya tetap ada
 * dan tinggal diberi jabatan baru.
 */

export interface JabatanSimpan {
  nama: string;
  urut: number;
}

export interface PerangkatSimpan {
  nama: string;
  jabatanId: number | null;
  gelarDepan: string | null;
  gelarBelakang: string | null;
  nip: string | null;
  nik: string | null;
  jenisKelamin: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  foto: string | null;
  penandaTangan: boolean;
  status: string;
  urut: number;
}

/** Daftar jabatan beserta jumlah perangkat yang menjabat. */
export async function listJabatanAdmin(villageId: number): Promise<JabatanAdminRow[]> {
  return db
    .select({
      id: jabatanPerangkat.id,
      nama: jabatanPerangkat.nama,
      slug: jabatanPerangkat.slug,
      urut: jabatanPerangkat.urut,
      jumlahPerangkat: sql<number>`(
        select count(*) from ${perangkatDesa}
        where ${perangkatDesa.jabatanId} = ${jabatanPerangkat.id}
      )`,
    })
    .from(jabatanPerangkat)
    .where(eq(jabatanPerangkat.villageId, villageId))
    .orderBy(asc(jabatanPerangkat.urut), asc(jabatanPerangkat.nama));
}

/** Pilihan jabatan untuk form perangkat. */
export async function listJabatanOption(villageId: number): Promise<JabatanOption[]> {
  return db
    .select({ id: jabatanPerangkat.id, nama: jabatanPerangkat.nama })
    .from(jabatanPerangkat)
    .where(eq(jabatanPerangkat.villageId, villageId))
    .orderBy(asc(jabatanPerangkat.urut), asc(jabatanPerangkat.nama));
}

/** Apakah jabatan dengan slug ini sudah dipakai desa (kecuali baris diubah)? */
export async function slugJabatanDipakai(
  villageId: number,
  slug: string,
  kecualiId: number | null,
): Promise<boolean> {
  const kondisi = [eq(jabatanPerangkat.villageId, villageId), eq(jabatanPerangkat.slug, slug)];
  if (kecualiId !== null) kondisi.push(ne(jabatanPerangkat.id, kecualiId));

  const [row] = await db
    .select({ id: jabatanPerangkat.id })
    .from(jabatanPerangkat)
    .where(and(...kondisi))
    .limit(1);

  return Boolean(row);
}

/** Pastikan jabatan yang dipilih milik desa ini. */
export async function jabatanMilikDesa(villageId: number, id: number): Promise<boolean> {
  const [row] = await db
    .select({ id: jabatanPerangkat.id })
    .from(jabatanPerangkat)
    .where(and(eq(jabatanPerangkat.villageId, villageId), eq(jabatanPerangkat.id, id)))
    .limit(1);

  return Boolean(row);
}

/** Tambah jabatan; mengembalikan id. */
export async function insertJabatan(
  villageId: number,
  slug: string,
  data: JabatanSimpan,
): Promise<number> {
  const [hasil] = await db
    .insert(jabatanPerangkat)
    .values({ villageId, slug, ...data })
    .$returningId();

  if (!hasil) throw new Error("Gagal menyimpan jabatan.");
  return hasil.id;
}

/** Perbarui jabatan milik desa. */
export async function updateJabatan(id: number, slug: string, data: JabatanSimpan): Promise<void> {
  await db
    .update(jabatanPerangkat)
    .set({ slug, ...data })
    .where(eq(jabatanPerangkat.id, id));
}

/** Hapus jabatan; perangkat terkait menjadi tanpa jabatan (FK `set null`). */
export async function deleteJabatan(id: number): Promise<void> {
  await db.delete(jabatanPerangkat).where(eq(jabatanPerangkat.id, id));
}

/** Daftar perangkat desa (semua status) untuk halaman admin. */
export async function listPerangkatAdmin(villageId: number): Promise<PerangkatAdmin[]> {
  return db
    .select({
      id: perangkatDesa.id,
      nama: perangkatDesa.nama,
      gelarDepan: perangkatDesa.gelarDepan,
      gelarBelakang: perangkatDesa.gelarBelakang,
      jabatanId: perangkatDesa.jabatanId,
      jabatan: jabatanPerangkat.nama,
      nip: perangkatDesa.nip,
      nik: perangkatDesa.nik,
      jenisKelamin: perangkatDesa.jenisKelamin,
      tempatLahir: perangkatDesa.tempatLahir,
      tanggalLahir: perangkatDesa.tanggalLahir,
      foto: perangkatDesa.foto,
      penandaTangan: perangkatDesa.penandaTangan,
      status: perangkatDesa.status,
      urut: perangkatDesa.urut,
    })
    .from(perangkatDesa)
    .leftJoin(jabatanPerangkat, eq(perangkatDesa.jabatanId, jabatanPerangkat.id))
    .where(eq(perangkatDesa.villageId, villageId))
    .orderBy(asc(perangkatDesa.urut), desc(perangkatDesa.id));
}

/** Satu perangkat milik desa, atau `null`. */
export async function getPerangkatAdmin(
  villageId: number,
  id: number,
): Promise<PerangkatAdmin | null> {
  const [row] = await db
    .select({
      id: perangkatDesa.id,
      nama: perangkatDesa.nama,
      gelarDepan: perangkatDesa.gelarDepan,
      gelarBelakang: perangkatDesa.gelarBelakang,
      jabatanId: perangkatDesa.jabatanId,
      jabatan: jabatanPerangkat.nama,
      nip: perangkatDesa.nip,
      nik: perangkatDesa.nik,
      jenisKelamin: perangkatDesa.jenisKelamin,
      tempatLahir: perangkatDesa.tempatLahir,
      tanggalLahir: perangkatDesa.tanggalLahir,
      foto: perangkatDesa.foto,
      penandaTangan: perangkatDesa.penandaTangan,
      status: perangkatDesa.status,
      urut: perangkatDesa.urut,
    })
    .from(perangkatDesa)
    .leftJoin(jabatanPerangkat, eq(perangkatDesa.jabatanId, jabatanPerangkat.id))
    .where(and(eq(perangkatDesa.villageId, villageId), eq(perangkatDesa.id, id)))
    .limit(1);

  return row ?? null;
}

/** Tambah perangkat; mengembalikan id. */
export async function insertPerangkat(villageId: number, data: PerangkatSimpan): Promise<number> {
  const [hasil] = await db
    .insert(perangkatDesa)
    .values({ villageId, ...data })
    .$returningId();

  if (!hasil) throw new Error("Gagal menyimpan perangkat desa.");
  return hasil.id;
}

/** Perbarui perangkat milik desa. */
export async function updatePerangkat(id: number, data: PerangkatSimpan): Promise<void> {
  await db.update(perangkatDesa).set(data).where(eq(perangkatDesa.id, id));
}

/** Hapus perangkat; berkas foto dibersihkan application layer. */
export async function deletePerangkat(id: number): Promise<void> {
  await db.delete(perangkatDesa).where(eq(perangkatDesa.id, id));
}
