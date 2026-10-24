import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { namaBerkasAman, validasiMedia } from "@/features/publik/domain/media";

/**
 * Penyimpanan media situs publik (gambar, dokumen) di disk lokal — Fase 1C.3.
 *
 * Mengikuti pola `laporan-storage.ts`: berkas disimpan di bawah
 * `storage/media/<villageId>/<kategori>/` dan jalur yang dicatat di basis data
 * **selalu relatif** terhadap akar penyimpanan, sehingga folder dapat
 * dipindahkan tanpa mengubah data.
 *
 * Nama berkas di disk dibuat unik (cap waktu + nama aman) dan ekstensinya
 * ditentukan dari MIME yang tervalidasi, bukan dari nama kiriman — berkas
 * berbahaya (`shell.php`) tidak akan pernah tersimpan dengan ekstensi yang
 * dapat dieksekusi.
 */

const AKAR_PENYIMPANAN = path.join(process.cwd(), "storage", "media");

/** Kategori menentukan subfolder; memudahkan pemisahan jenis konten. */
export type KategoriMedia =
  "berita" | "galeri" | "slider" | "perangkat" | "dokumen" | "permohonan" | "umum";

export function akarPenyimpananMedia(): string {
  return AKAR_PENYIMPANAN;
}

/**
 * Susun jalur relatif untuk berkas media baru.
 *
 * @param villageId pemilik berkas (kunci tenant)
 * @param kategori subfolder kategori
 * @param namaAman nama aman (lihat `namaBerkasAman`)
 * @param ekstensi ekstensi kanonik dari MIME tervalidasi (mis. `jpg`)
 */
export function jalurRelatifMedia(
  villageId: number,
  kategori: KategoriMedia,
  namaAman: string,
  ekstensi: string,
): string {
  return path.posix.join(
    String(villageId),
    kategori,
    `${Date.now()}-${namaAman}.${ekstensi.replace(/[^a-z0-9]/gi, "").toLowerCase()}`,
  );
}

/**
 * Ubah jalur relatif menjadi absolut, sambil menolak keluar dari akar
 * penyimpanan (path traversal).
 */
export function jalurAbsolutMedia(relatif: string): string {
  const absolut = path.resolve(AKAR_PENYIMPANAN, relatif);
  const akar = path.resolve(AKAR_PENYIMPANAN);
  if (absolut !== akar && !absolut.startsWith(akar + path.sep)) {
    throw new Error("Jalur media di luar penyimpanan.");
  }
  return absolut;
}

/** Simpan isi berkas media pada jalur relatif yang sudah disiapkan. */
export async function simpanMedia(relatif: string, isi: Uint8Array): Promise<void> {
  const absolut = jalurAbsolutMedia(relatif);
  await mkdir(path.dirname(absolut), { recursive: true });
  await writeFile(absolut, isi);
}

/** Baca isi berkas media. */
export async function bacaMedia(relatif: string): Promise<Buffer> {
  return readFile(jalurAbsolutMedia(relatif));
}

/** Hapus berkas media; diamkan bila berkas sudah tidak ada. */
export async function hapusMedia(relatif: string): Promise<void> {
  try {
    await unlink(jalurAbsolutMedia(relatif));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export interface HasilSimpanMedia {
  /** Jalur relatif yang harus dicatat di basis data. */
  jalur: string;
  mime: string;
}

/**
 * Validasi lalu simpan berkas unggahan.
 *
 * @throws Error dengan pesan ramah-baca bila MIME/ukuran tidak sah.
 */
export async function simpanUnggahanMedia(
  villageId: number,
  kategori: KategoriMedia,
  berkas: { nama: string; mime: string | null; ukuran: number; isi: Uint8Array },
): Promise<HasilSimpanMedia> {
  const validasi = validasiMedia(berkas.mime, berkas.ukuran);
  if (!validasi.ok) throw new Error(validasi.pesan);

  const relatif = jalurRelatifMedia(
    villageId,
    kategori,
    namaBerkasAman(berkas.nama),
    validasi.jenis.ekstensi,
  );
  await simpanMedia(relatif, berkas.isi);

  return { jalur: relatif, mime: validasi.jenis.mime };
}
