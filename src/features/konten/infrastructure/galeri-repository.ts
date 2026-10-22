import "server-only";

import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { galeriAlbum, galeriFoto } from "@/db/schema";

import type { AlbumAdminRow, FotoAdminRow } from "../domain/galeri";

/**
 * Akses data galeri (Fase 1F.3).
 *
 * Semua fungsi menerima `villageId` dari sesi dan memasukkannya ke `WHERE`.
 * Foto selalu dicari lewat `villageId` + `albumId` sehingga album desa lain
 * tidak dapat dibaca atau diubah meski id-nya ditebak.
 */

export interface AlbumSimpan {
  nama: string;
  keterangan: string | null;
  sampul: string | null;
  aktif: boolean;
  urut: number;
}

export interface FotoSimpan {
  judul: string | null;
  keterangan: string | null;
  urut: number;
  aktif: boolean;
  slider: boolean;
}

/** Daftar album untuk admin, lengkap dengan jumlah foto (termasuk nonaktif). */
export async function listAlbumAdmin(villageId: number): Promise<AlbumAdminRow[]> {
  return db
    .select({
      id: galeriAlbum.id,
      nama: galeriAlbum.nama,
      slug: galeriAlbum.slug,
      keterangan: galeriAlbum.keterangan,
      sampul: galeriAlbum.sampul,
      aktif: galeriAlbum.aktif,
      urut: galeriAlbum.urut,
      jumlahFoto: sql<number>`(
        select count(*) from ${galeriFoto}
        where ${galeriFoto.albumId} = ${galeriAlbum.id}
      )`,
    })
    .from(galeriAlbum)
    .where(eq(galeriAlbum.villageId, villageId))
    .orderBy(asc(galeriAlbum.urut), desc(galeriAlbum.id));
}

/** Satu album milik desa, atau `null`. */
export async function getAlbumAdmin(villageId: number, id: number): Promise<AlbumAdminRow | null> {
  const [row] = await db
    .select({
      id: galeriAlbum.id,
      nama: galeriAlbum.nama,
      slug: galeriAlbum.slug,
      keterangan: galeriAlbum.keterangan,
      sampul: galeriAlbum.sampul,
      aktif: galeriAlbum.aktif,
      urut: galeriAlbum.urut,
      jumlahFoto: sql<number>`(
        select count(*) from ${galeriFoto}
        where ${galeriFoto.albumId} = ${galeriAlbum.id}
      )`,
    })
    .from(galeriAlbum)
    .where(and(eq(galeriAlbum.villageId, villageId), eq(galeriAlbum.id, id)))
    .limit(1);

  return row ?? null;
}

/** Apakah slug album sudah dipakai desa ini (kecuali baris yang diubah)? */
export async function slugAlbumDipakai(
  villageId: number,
  slug: string,
  kecualiId: number | null,
): Promise<boolean> {
  const kondisi = [eq(galeriAlbum.villageId, villageId), eq(galeriAlbum.slug, slug)];
  if (kecualiId !== null) kondisi.push(ne(galeriAlbum.id, kecualiId));

  const [row] = await db
    .select({ id: galeriAlbum.id })
    .from(galeriAlbum)
    .where(and(...kondisi))
    .limit(1);

  return Boolean(row);
}

/** Simpan album baru; mengembalikan id. */
export async function insertAlbum(
  villageId: number,
  slug: string,
  data: AlbumSimpan,
): Promise<number> {
  const [hasil] = await db
    .insert(galeriAlbum)
    .values({ villageId, slug, ...data })
    .$returningId();

  if (!hasil) throw new Error("Gagal menyimpan album galeri.");
  return hasil.id;
}

/** Perbarui album milik desa. */
export async function updateAlbum(id: number, slug: string, data: AlbumSimpan): Promise<void> {
  await db
    .update(galeriAlbum)
    .set({ slug, ...data })
    .where(eq(galeriAlbum.id, id));
}

/** Hapus album; baris foto ikut terhapus lewat FK `cascade`. */
export async function deleteAlbum(id: number): Promise<void> {
  await db.delete(galeriAlbum).where(eq(galeriAlbum.id, id));
}

/** Semua foto album (termasuk nonaktif) untuk halaman kelola. */
export async function listFotoAdmin(villageId: number, albumId: number): Promise<FotoAdminRow[]> {
  return db
    .select({
      id: galeriFoto.id,
      gambar: galeriFoto.gambar,
      judul: galeriFoto.judul,
      keterangan: galeriFoto.keterangan,
      urut: galeriFoto.urut,
      aktif: galeriFoto.aktif,
      slider: galeriFoto.slider,
    })
    .from(galeriFoto)
    .where(and(eq(galeriFoto.villageId, villageId), eq(galeriFoto.albumId, albumId)))
    .orderBy(asc(galeriFoto.urut), desc(galeriFoto.id));
}

/** Satu foto milik desa, atau `null`. */
export async function getFotoAdmin(villageId: number, id: number): Promise<FotoAdminRow | null> {
  const [row] = await db
    .select({
      id: galeriFoto.id,
      gambar: galeriFoto.gambar,
      judul: galeriFoto.judul,
      keterangan: galeriFoto.keterangan,
      urut: galeriFoto.urut,
      aktif: galeriFoto.aktif,
      slider: galeriFoto.slider,
    })
    .from(galeriFoto)
    .where(and(eq(galeriFoto.villageId, villageId), eq(galeriFoto.id, id)))
    .limit(1);

  return row ?? null;
}

/** Nomor urut berikutnya untuk foto baru di sebuah album. */
export async function urutFotoBerikutnya(villageId: number, albumId: number): Promise<number> {
  const [row] = await db
    .select({ urut: galeriFoto.urut })
    .from(galeriFoto)
    .where(and(eq(galeriFoto.villageId, villageId), eq(galeriFoto.albumId, albumId)))
    .orderBy(desc(galeriFoto.urut))
    .limit(1);

  return (row?.urut ?? 0) + 1;
}

/** Simpan foto baru; mengembalikan id. */
export async function insertFoto(
  villageId: number,
  albumId: number,
  gambar: string,
  data: FotoSimpan,
): Promise<number> {
  const [hasil] = await db
    .insert(galeriFoto)
    .values({ villageId, albumId, gambar, ...data })
    .$returningId();

  if (!hasil) throw new Error("Gagal menyimpan foto galeri.");
  return hasil.id;
}

/** Perbarui metadata foto milik desa. */
export async function updateFoto(id: number, data: FotoSimpan): Promise<void> {
  await db.update(galeriFoto).set(data).where(eq(galeriFoto.id, id));
}

/** Hapus satu foto. */
export async function deleteFoto(id: number): Promise<void> {
  await db.delete(galeriFoto).where(eq(galeriFoto.id, id));
}

/** Semua jalur gambar pada album, untuk pembersihan berkas saat album dihapus. */
export async function listJalurFotoAlbum(villageId: number, albumId: number): Promise<string[]> {
  const rows = await db
    .select({ gambar: galeriFoto.gambar })
    .from(galeriFoto)
    .where(and(eq(galeriFoto.villageId, villageId), eq(galeriFoto.albumId, albumId)));

  return rows.map((row) => row.gambar);
}
