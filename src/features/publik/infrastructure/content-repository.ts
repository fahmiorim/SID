import "server-only";

import { and, asc, count, desc, eq, isNotNull, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  berita,
  beritaKategori,
  dokumenPublik,
  galeriAlbum,
  galeriFoto,
  halamanStatis,
  jabatanPerangkat,
  menuPublik,
  perangkatDesa,
  profilDesa,
  slider,
  widget,
} from "@/db/schema";

/**
 * Query konten situs publik (Fase 1C).
 *
 * Seluruh fungsi **wajib** menerima `villageId` dari host (dilihat di
 * `getIdentitasFromRequest()`) sehingga tidak ada data yang bocor antar-desa.
 * Hanya konten berstatus tampil (published/aktif) yang dikembalikan; berita
 * berjadwal disembunyikan sampai `terbit_pada` tiba.
 */

/** Predikat "berita sudah layak tayang": published dan jadwal terbit sudah lewat. */
function beritaLayakTayang(villageId: number) {
  return and(
    eq(berita.villageId, villageId),
    eq(berita.status, "published"),
    or(sql`${berita.terbitPada} is null`, lte(berita.terbitPada, new Date())),
  );
}

export interface BeritaRingkas {
  id: number;
  judul: string;
  slug: string;
  ringkasan: string | null;
  gambar: string | null;
  terbitPada: Date | null;
  createdAt: Date;
  kategori: string | null;
  headline: boolean;
}

export async function listBerita(
  villageId: number,
  opsi: { limit?: number; kategoriSlug?: string; headlineSaja?: boolean } = {},
): Promise<BeritaRingkas[]> {
  const kondisi = [beritaLayakTayang(villageId)];

  if (opsi.kategoriSlug) {
    kondisi.push(eq(beritaKategori.slug, opsi.kategoriSlug));
  }
  if (opsi.headlineSaja) {
    kondisi.push(eq(berita.headline, true));
  }

  const rows = await db
    .select({
      id: berita.id,
      judul: berita.judul,
      slug: berita.slug,
      ringkasan: berita.ringkasan,
      gambar: berita.gambar,
      terbitPada: berita.terbitPada,
      createdAt: berita.createdAt,
      kategori: beritaKategori.nama,
      headline: berita.headline,
    })
    .from(berita)
    .leftJoin(beritaKategori, eq(berita.kategoriId, beritaKategori.id))
    .where(and(...kondisi))
    .orderBy(desc(berita.terbitPada), desc(berita.createdAt))
    .limit(opsi.limit ?? 20);

  return rows;
}

/** Banyaknya berita tayang; untuk paginasi/arsip. */
export async function countBerita(villageId: number, kategoriSlug?: string): Promise<number> {
  const kondisi = [beritaLayakTayang(villageId)];
  if (kategoriSlug) kondisi.push(eq(beritaKategori.slug, kategoriSlug));

  const [row] = await db
    .select({ value: count() })
    .from(berita)
    .leftJoin(beritaKategori, eq(berita.kategoriId, beritaKategori.id))
    .where(and(...kondisi));

  return row?.value ?? 0;
}

export interface BeritaDetail extends BeritaRingkas {
  isi: string;
  dokumen: string | null;
  hit: number;
}

export async function getBeritaBySlug(
  villageId: number,
  slug: string,
): Promise<BeritaDetail | null> {
  const [row] = await db
    .select({
      id: berita.id,
      judul: berita.judul,
      slug: berita.slug,
      ringkasan: berita.ringkasan,
      gambar: berita.gambar,
      dokumen: berita.dokumen,
      isi: berita.isi,
      hit: berita.hit,
      terbitPada: berita.terbitPada,
      createdAt: berita.createdAt,
      kategori: beritaKategori.nama,
      headline: berita.headline,
    })
    .from(berita)
    .leftJoin(beritaKategori, eq(berita.kategoriId, beritaKategori.id))
    .where(and(beritaLayakTayang(villageId), eq(berita.slug, slug)))
    .limit(1);

  return row ?? null;
}

/** Naikkan penghitung kunjungan berita (best-effort, tidak menunggu hasil). */
export async function tambahHitBerita(id: number): Promise<void> {
  await db
    .update(berita)
    .set({ hit: sql`${berita.hit} + 1` })
    .where(eq(berita.id, id));
}

export interface KategoriRingkas {
  id: number;
  nama: string;
  slug: string;
}

export async function listKategoriBerita(villageId: number): Promise<KategoriRingkas[]> {
  return db
    .select({ id: beritaKategori.id, nama: beritaKategori.nama, slug: beritaKategori.slug })
    .from(beritaKategori)
    .where(and(eq(beritaKategori.villageId, villageId), eq(beritaKategori.aktif, true)))
    .orderBy(asc(beritaKategori.urut));
}

/* ------------------------------------------------------------------ galeri */

export interface AlbumRingkas {
  id: number;
  nama: string;
  slug: string;
  keterangan: string | null;
  sampul: string | null;
  jumlahFoto: number;
}

export async function listAlbumGaleri(villageId: number): Promise<AlbumRingkas[]> {
  const rows = await db
    .select({
      id: galeriAlbum.id,
      nama: galeriAlbum.nama,
      slug: galeriAlbum.slug,
      keterangan: galeriAlbum.keterangan,
      sampul: galeriAlbum.sampul,
      urut: galeriAlbum.urut,
      jumlahFoto: sql<number>`(
        select count(*) from ${galeriFoto}
        where ${galeriFoto.albumId} = ${galeriAlbum.id} and ${galeriFoto.aktif} = true
      )`,
    })
    .from(galeriAlbum)
    .where(and(eq(galeriAlbum.villageId, villageId), eq(galeriAlbum.aktif, true)))
    .orderBy(asc(galeriAlbum.urut), desc(galeriAlbum.id));

  return rows.map(({ urut: _urut, ...album }) => album);
}

export async function getAlbumBySlug(
  villageId: number,
  slug: string,
): Promise<AlbumRingkas | null> {
  const [row] = await db
    .select({
      id: galeriAlbum.id,
      nama: galeriAlbum.nama,
      slug: galeriAlbum.slug,
      keterangan: galeriAlbum.keterangan,
      sampul: galeriAlbum.sampul,
    })
    .from(galeriAlbum)
    .where(
      and(
        eq(galeriAlbum.villageId, villageId),
        eq(galeriAlbum.slug, slug),
        eq(galeriAlbum.aktif, true),
      ),
    )
    .limit(1);

  if (!row) return null;

  const [jumlah] = await db
    .select({ value: count() })
    .from(galeriFoto)
    .where(and(eq(galeriFoto.albumId, row.id), eq(galeriFoto.aktif, true)));

  return { ...row, jumlahFoto: jumlah?.value ?? 0 };
}

export interface FotoRingkas {
  id: number;
  gambar: string;
  judul: string | null;
  keterangan: string | null;
}

export async function listFotoAlbum(villageId: number, albumId: number): Promise<FotoRingkas[]> {
  return db
    .select({
      id: galeriFoto.id,
      gambar: galeriFoto.gambar,
      judul: galeriFoto.judul,
      keterangan: galeriFoto.keterangan,
    })
    .from(galeriFoto)
    .where(
      and(
        eq(galeriFoto.villageId, villageId),
        eq(galeriFoto.albumId, albumId),
        eq(galeriFoto.aktif, true),
      ),
    )
    .orderBy(asc(galeriFoto.urut), desc(galeriFoto.id));
}

/** Foto slider beranda (dari `slider` dan foto galeri bertanda slider). */
export async function listSliderBeranda(villageId: number): Promise<FotoRingkas[]> {
  const rows = await db
    .select({
      id: slider.id,
      gambar: slider.gambar,
      judul: slider.judul,
      keterangan: slider.keterangan,
    })
    .from(slider)
    .where(and(eq(slider.villageId, villageId), eq(slider.aktif, true)))
    .orderBy(asc(slider.urut), desc(slider.id));

  if (rows.length > 0) return rows;

  return db
    .select({
      id: galeriFoto.id,
      gambar: galeriFoto.gambar,
      judul: galeriFoto.judul,
      keterangan: galeriFoto.keterangan,
    })
    .from(galeriFoto)
    .where(
      and(
        eq(galeriFoto.villageId, villageId),
        eq(galeriFoto.slider, true),
        eq(galeriFoto.aktif, true),
      ),
    )
    .orderBy(asc(galeriFoto.urut), desc(galeriFoto.id));
}

/* ------------------------------------------------------------------ profil */

export interface ProfilRingkas {
  visi: string | null;
  misi: string | null;
  sejarah: string | null;
  sambutan: string | null;
  koordinat: string | null;
}

export async function getProfilDesa(villageId: number): Promise<ProfilRingkas | null> {
  const [row] = await db
    .select({
      visi: profilDesa.visi,
      misi: profilDesa.misi,
      sejarah: profilDesa.sejarah,
      sambutan: profilDesa.sambutan,
      koordinat: profilDesa.koordinat,
    })
    .from(profilDesa)
    .where(eq(profilDesa.villageId, villageId))
    .limit(1);

  return row ?? null;
}

/* -------------------------------------------------------------- perangkat */

export interface PerangkatRingkas {
  id: number;
  nama: string;
  gelarDepan: string | null;
  gelarBelakang: string | null;
  jabatan: string | null;
  nip: string | null;
  jenisKelamin: string | null;
  foto: string | null;
  urut: number;
  periode: string | null;
}

export async function listPerangkatDesa(villageId: number): Promise<PerangkatRingkas[]> {
  return db
    .select({
      id: perangkatDesa.id,
      nama: perangkatDesa.nama,
      gelarDepan: perangkatDesa.gelarDepan,
      gelarBelakang: perangkatDesa.gelarBelakang,
      jabatan: jabatanPerangkat.nama,
      nip: perangkatDesa.nip,
      jenisKelamin: perangkatDesa.jenisKelamin,
      foto: perangkatDesa.foto,
      urut: perangkatDesa.urut,
      periode: perangkatDesa.periode,
    })
    .from(perangkatDesa)
    .leftJoin(jabatanPerangkat, eq(perangkatDesa.jabatanId, jabatanPerangkat.id))
    .where(and(eq(perangkatDesa.villageId, villageId), eq(perangkatDesa.status, "aktif")))
    .orderBy(asc(perangkatDesa.urut), asc(perangkatDesa.id));
}

/* --------------------------------------------------------------- dokumen */

export interface DokumenRingkas {
  id: number;
  nama: string;
  slug: string;
  kategori: string;
  jenis: string | null;
  nomor: string | null;
  tahun: number | null;
  berkas: string | null;
  tautan: string | null;
  keterangan: string | null;
}

export async function listDokumenPublik(
  villageId: number,
  kategori?: string,
): Promise<DokumenRingkas[]> {
  const kondisi = [eq(dokumenPublik.villageId, villageId), eq(dokumenPublik.aktif, true)];
  if (kategori) kondisi.push(eq(dokumenPublik.kategori, kategori));

  return db
    .select({
      id: dokumenPublik.id,
      nama: dokumenPublik.nama,
      slug: dokumenPublik.slug,
      kategori: dokumenPublik.kategori,
      jenis: dokumenPublik.jenis,
      nomor: dokumenPublik.nomor,
      tahun: dokumenPublik.tahun,
      berkas: dokumenPublik.berkas,
      tautan: dokumenPublik.tautan,
      keterangan: dokumenPublik.keterangan,
    })
    .from(dokumenPublik)
    .where(and(...kondisi))
    .orderBy(desc(dokumenPublik.tahun), asc(dokumenPublik.nama));
}

/* ----------------------------------------------------------- menu & widget */

export interface MenuPublikRingkas {
  id: number;
  nama: string;
  link: string;
  linkTipe: string;
  parentId: number | null;
  urut: number;
  aktif: boolean;
}

export async function listMenuPublik(villageId: number): Promise<MenuPublikRingkas[]> {
  return db
    .select({
      id: menuPublik.id,
      nama: menuPublik.nama,
      link: menuPublik.link,
      linkTipe: menuPublik.linkTipe,
      parentId: menuPublik.parentId,
      urut: menuPublik.urut,
      aktif: menuPublik.aktif,
    })
    .from(menuPublik)
    .where(and(eq(menuPublik.villageId, villageId), eq(menuPublik.aktif, true)))
    .orderBy(asc(menuPublik.urut), asc(menuPublik.id));
}

/** Menambahkan baris menu publik. */
export async function createMenuPublik(
  villageId: number,
  data: { nama: string; link: string; linkTipe: string; parentId?: number; urut?: number },
): Promise<void> {
  await db.insert(menuPublik).values({ villageId, ...data });
}

/** Mengubah satu baris menu publik. */
export async function updateMenuPublik(
  villageId: number,
  id: number,
  data: Partial<{ nama: string; link: string; linkTipe: string; parentId?: number; urut?: number }>,
): Promise<void> {
  await db
    .update(menuPublik)
    .set({ villageId, ...data })
    .where(eq(menuPublik.id, id));
}

/** Menghapus satu baris menu publik. */
export async function deleteMenuPublik(villageId: number, id: number): Promise<void> {
  await db.delete(menuPublik).where(eq(menuPublik.id, id));
}

/* -------------------------------------------------------- halaman statis */
export interface WidgetRingkas {
  id: number;
  judul: string | null;
  isi: string | null;
  jenis: number;
  pengaturan: string | null;
}

export async function listWidget(villageId: number): Promise<WidgetRingkas[]> {
  return db
    .select({
      id: widget.id,
      judul: widget.judul,
      isi: widget.isi,
      jenis: widget.jenis,
      pengaturan: widget.pengaturan,
    })
    .from(widget)
    .where(and(eq(widget.villageId, villageId), eq(widget.aktif, true)))
    .orderBy(asc(widget.urut), asc(widget.id));
} /** Menambahkan baris widget. */
export async function createWidget(
  villageId: number,
  data: { judul: string | null; isi: string | null; jenis: number; pengaturan: string | null },
): Promise<void> {
  await db.insert(widget).values({ villageId, ...data });
}

/** Mengubah satu baris widget. */
export async function updateWidget(
  villageId: number,
  id: number,
  data: Partial<{
    judul: string | null;
    isi: string | null;
    jenis: number;
    pengaturan: string | null;
  }>,
): Promise<void> {
  await db
    .update(widget)
    .set({ villageId, ...data })
    .where(eq(widget.id, id));
}

/** Menghapus satu baris widget. */
export async function deleteWidget(villageId: number, id: number): Promise<void> {
  await db.delete(widget).where(eq(widget.id, id));
}

/** Menambahkan baris dokumen publik. */
export async function createDokumenPublik(
  villageId: number,
  data: { nama: string; slug: string; kategori: string; keterangan: string },
): Promise<void> {
  await db.insert(dokumenPublik).values({ villageId, ...data });
}

/** Mengubah satu baris dokumen publik. */
export async function updateDokumenPublik(
  villageId: number,
  id: number,
  data: Partial<{
    nama: string;
    slug: string;
    kategori: string;
    keterangan: string;
    berkas: string | null;
    tautan: string | null;
    tahun: number | null;
  }>,
): Promise<void> {
  await db
    .update(dokumenPublik)
    .set({ villageId, ...data })
    .where(eq(dokumenPublik.id, id));
}

/** Menghapus satu baris dokumen publik. */
export async function deleteDokumenPublik(villageId: number, id: number): Promise<void> {
  await db.delete(dokumenPublik).where(eq(dokumenPublik.id, id));
}

/* -------------------------------------------------------- halaman statis */
export interface HalamanRingkas {
  judul: string;
  slug: string;
  isi: string;
}

export async function getHalamanBySlug(
  villageId: number,
  slug: string,
): Promise<HalamanRingkas | null> {
  const [row] = await db
    .select({ judul: halamanStatis.judul, slug: halamanStatis.slug, isi: halamanStatis.isi })
    .from(halamanStatis)
    .where(
      and(
        eq(halamanStatis.villageId, villageId),
        eq(halamanStatis.slug, slug),
        eq(halamanStatis.aktif, true),
      ),
    )
    .limit(1);

  return row ?? null;
}

/** Daftar slug halaman statis aktif untuk `sitemap.ts`. */
export async function listSlugHalaman(villageId: number): Promise<string[]> {
  const rows = await db
    .select({ slug: halamanStatis.slug })
    .from(halamanStatis)
    .where(and(eq(halamanStatis.villageId, villageId), eq(halamanStatis.aktif, true)));
  return rows.map((row) => row.slug);
}

/** Daftar slug berita tayang untuk `sitemap.ts`. */
export async function listSlugBerita(villageId: number): Promise<string[]> {
  const rows = await db
    .select({ slug: berita.slug })
    .from(berita)
    .where(and(beritaLayakTayang(villageId), isNotNull(berita.slug)));
  return rows.map((row) => row.slug);
}
