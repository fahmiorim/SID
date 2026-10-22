import "server-only";

import { and, asc, count, desc, eq, like, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { berita, beritaKategori } from "@/db/schema";

import type {
  BeritaAdminDetail,
  BeritaAdminListResult,
  BeritaAdminRow,
  KategoriBeritaOption,
  KategoriBeritaRow,
} from "../domain/berita";

/**
 * Akses data konten berita (Fase 1F.2).
 *
 * Semua fungsi menerima `villageId` dari lapisan application (berasal dari
 * sesi) dan memasukkannya ke `WHERE`; tidak ada jalur yang membaca berita desa
 * lain. Kolom internal tidak bocor ke UI — repository memetakan ke DTO.
 */

const PAGE_SIZE_DEFAULT = 10;

/** Nilai yang boleh disimpan pada form berita (sudah tervalidasi & tersanitasi). */
export interface BeritaSimpan {
  judul: string;
  kategoriId: number | null;
  ringkasan: string | null;
  isi: string;
  status: string;
  terbitPada: Date | null;
  headline: boolean;
  slider: boolean;
  bolehKomentar: boolean;
  gambar: string | null;
  dokumen: string | null;
}

/** `Date` → `YYYY-MM-DD` (untuk nilai input tanggal), menurut zona waktu lokal. */
function tanggalInput(nilai: Date | null): string | null {
  if (!nilai) return null;
  const tahun = nilai.getFullYear();
  const bulan = String(nilai.getMonth() + 1).padStart(2, "0");
  const hari = String(nilai.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

/** Kondisi pencarian/filter daftar berita. */
function kondisiDaftar(villageId: number, search: string, status: string) {
  const kondisi = [eq(berita.villageId, villageId)];

  if (search) {
    const pola = `%${search}%`;
    const cocok = or(like(berita.judul, pola), like(berita.ringkasan, pola));
    if (cocok) kondisi.push(cocok);
  }

  if (status === "draft" || status === "published") {
    kondisi.push(eq(berita.status, status));
  }

  return and(...kondisi);
}

/** Daftar berita untuk halaman admin, dengan pencarian, filter status, paginasi. */
export async function listBeritaAdmin(params: {
  villageId: number;
  search: string;
  status: string;
  page: number;
  pageSize?: number;
}): Promise<BeritaAdminListResult> {
  const pageSize = Math.max(1, params.pageSize ?? PAGE_SIZE_DEFAULT);
  const where = kondisiDaftar(params.villageId, params.search, params.status);

  const [totalRow] = await db.select({ value: count() }).from(berita).where(where);
  const total = totalRow?.value ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, params.page), pageCount);

  const rows: BeritaAdminRow[] = await db
    .select({
      id: berita.id,
      judul: berita.judul,
      slug: berita.slug,
      kategori: beritaKategori.nama,
      status: berita.status,
      terbitPada: berita.terbitPada,
      headline: berita.headline,
      updatedAt: berita.updatedAt,
    })
    .from(berita)
    .leftJoin(beritaKategori, eq(berita.kategoriId, beritaKategori.id))
    .where(where)
    .orderBy(desc(berita.updatedAt), desc(berita.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { rows, total, page, pageSize, pageCount };
}

/** Satu berita lengkap milik desa, atau `null` bila tidak ada. */
export async function getBeritaAdmin(
  villageId: number,
  id: number,
): Promise<BeritaAdminDetail | null> {
  const [row] = await db
    .select({
      id: berita.id,
      judul: berita.judul,
      slug: berita.slug,
      kategoriId: berita.kategoriId,
      ringkasan: berita.ringkasan,
      isi: berita.isi,
      gambar: berita.gambar,
      dokumen: berita.dokumen,
      status: berita.status,
      terbitPada: berita.terbitPada,
      headline: berita.headline,
      slider: berita.slider,
      bolehKomentar: berita.bolehKomentar,
    })
    .from(berita)
    .where(and(eq(berita.villageId, villageId), eq(berita.id, id)))
    .limit(1);

  if (!row) return null;

  return { ...row, terbitPada: tanggalInput(row.terbitPada) };
}

/** Apakah slug berita sudah dipakai desa ini (kecuali baris yang sedang diubah)? */
export async function slugBeritaDipakai(
  villageId: number,
  slug: string,
  kecualiId: number | null,
): Promise<boolean> {
  const kondisi = [eq(berita.villageId, villageId), eq(berita.slug, slug)];
  if (kecualiId !== null) kondisi.push(ne(berita.id, kecualiId));

  const [row] = await db
    .select({ id: berita.id })
    .from(berita)
    .where(and(...kondisi))
    .limit(1);

  return Boolean(row);
}

/** Simpan berita baru; mengembalikan id baris. */
export async function insertBerita(
  villageId: number,
  penulisId: string | null,
  slug: string,
  data: BeritaSimpan,
): Promise<number> {
  const [hasil] = await db
    .insert(berita)
    .values({
      villageId,
      penulisId,
      slug,
      ...data,
    })
    .$returningId();

  if (!hasil) throw new Error("Gagal menyimpan berita.");
  return hasil.id;
}

/** Perbarui berita milik desa; slug & isi sudah disiapkan application layer. */
export async function updateBerita(id: number, slug: string, data: BeritaSimpan): Promise<void> {
  await db
    .update(berita)
    .set({ slug, ...data })
    .where(eq(berita.id, id));
}

/** Hapus berita berdasarkan id (scoping desa dilakukan sebelum memanggil ini). */
export async function deleteBerita(id: number): Promise<void> {
  await db.delete(berita).where(eq(berita.id, id));
}

/* -------------------------------------------------------------------------- */
/* Kategori                                                                   */
/* -------------------------------------------------------------------------- */

/** Semua kategori desa, terurut untuk tampilan admin. */
export async function listKategoriBeritaAdmin(villageId: number): Promise<KategoriBeritaRow[]> {
  return db
    .select({
      id: beritaKategori.id,
      nama: beritaKategori.nama,
      slug: beritaKategori.slug,
      urut: beritaKategori.urut,
      aktif: beritaKategori.aktif,
    })
    .from(beritaKategori)
    .where(eq(beritaKategori.villageId, villageId))
    .orderBy(asc(beritaKategori.urut), asc(beritaKategori.nama));
}

/** Pilihan kategori untuk form berita (termasuk yang nonaktif agar tidak kosong). */
export async function listKategoriBeritaOption(villageId: number): Promise<KategoriBeritaOption[]> {
  return db
    .select({ id: beritaKategori.id, nama: beritaKategori.nama })
    .from(beritaKategori)
    .where(eq(beritaKategori.villageId, villageId))
    .orderBy(asc(beritaKategori.urut), asc(beritaKategori.nama));
}

/** Apakah slug kategori sudah dipakai desa ini (kecuali baris yang diubah)? */
export async function slugKategoriDipakai(
  villageId: number,
  slug: string,
  kecualiId: number | null,
): Promise<boolean> {
  const kondisi = [eq(beritaKategori.villageId, villageId), eq(beritaKategori.slug, slug)];
  if (kecualiId !== null) kondisi.push(ne(beritaKategori.id, kecualiId));

  const [row] = await db
    .select({ id: beritaKategori.id })
    .from(beritaKategori)
    .where(and(...kondisi))
    .limit(1);

  return Boolean(row);
}

/** Pastikan kategori yang dipilih benar-benar milik desa ini. */
export async function kategoriMilikDesa(villageId: number, id: number): Promise<boolean> {
  const [row] = await db
    .select({ id: beritaKategori.id })
    .from(beritaKategori)
    .where(and(eq(beritaKategori.villageId, villageId), eq(beritaKategori.id, id)))
    .limit(1);

  return Boolean(row);
}

/** Tambah kategori baru. */
export async function insertKategori(
  villageId: number,
  data: { nama: string; slug: string; urut: number; aktif: boolean },
): Promise<number> {
  const [hasil] = await db
    .insert(beritaKategori)
    .values({ villageId, ...data })
    .$returningId();

  if (!hasil) throw new Error("Gagal menyimpan kategori berita.");
  return hasil.id;
}

/** Perbarui kategori milik desa. */
export async function updateKategori(
  id: number,
  data: { nama: string; slug: string; urut: number; aktif: boolean },
): Promise<void> {
  await db.update(beritaKategori).set(data).where(eq(beritaKategori.id, id));
}

/** Hapus kategori; berita terkait menjadi tanpa kategori (FK `set null`). */
export async function deleteKategori(id: number): Promise<void> {
  await db.delete(beritaKategori).where(eq(beritaKategori.id, id));
}
