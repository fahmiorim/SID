import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { simpanBerkasMedia } from "@/features/publik/application/simpan-berkas-media";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import { hapusMedia } from "@/features/publik/infrastructure/media-storage";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";

import {
  GALERI_RESOURCE,
  MAKS_FOTO_PER_UNGGAH,
  slugAlbum,
  type AlbumAdminRow,
  type AlbumFormInput,
  type FotoAdminRow,
  type FotoFormInput,
  type HasilUnggahFoto,
} from "../domain/galeri";
import {
  deleteAlbum as deleteAlbumRow,
  deleteFoto as deleteFotoRow,
  getAlbumAdmin,
  getFotoAdmin,
  insertAlbum,
  insertFoto,
  listAlbumAdmin,
  listFotoAdmin,
  listJalurFotoAlbum,
  slugAlbumDipakai,
  updateAlbum as updateAlbumRow,
  updateFoto as updateFotoRow,
  urutFotoBerikutnya,
} from "../infrastructure/galeri-repository";

/**
 * Use case galeri (Fase 1F.3).
 *
 * Desa diambil dari sesi; album & foto selalu di-scope ke desa itu. Berkas
 * media divalidasi lewat helper bersama `simpanBerkasMedia`, dan setiap jalur
 * yang tidak lagi dirujuk dibersihkan agar penyimpanan tidak menumpuk.
 */

export async function listAlbum(): Promise<AlbumAdminRow[]> {
  const user = await requirePermission(GALERI_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listAlbumAdmin(villageId);
}

export async function getAlbum(id: number): Promise<AlbumAdminRow> {
  const user = await requirePermission(GALERI_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const album = await getAlbumAdmin(villageId, id);
  if (!album) throw notFound("Album galeri tidak ditemukan.");
  return album;
}

export async function listFoto(albumId: number): Promise<FotoAdminRow[]> {
  const user = await requirePermission(GALERI_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const album = await getAlbumAdmin(villageId, albumId);
  if (!album) throw notFound("Album galeri tidak ditemukan.");

  return listFotoAdmin(villageId, albumId);
}

/** Slug album bebas untuk desa ini. */
async function slugAlbumBebas(
  villageId: number,
  nama: string,
  kecualiId: number | null,
): Promise<string> {
  const dasar = slugAlbum(nama);

  for (let urutan = 1; urutan <= 200; urutan += 1) {
    const kandidat = urutan === 1 ? dasar : `${dasar}-${urutan}`;
    if (!(await slugAlbumDipakai(villageId, kandidat, kecualiId))) return kandidat;
  }

  throw conflict("Tidak dapat membentuk slug album yang unik.");
}

export interface MediaAlbum {
  /** Berkas sampul baru; kosong = pertahankan sampul lama. */
  sampul?: BerkasUnggahan | null;
}

export async function createAlbum(
  input: AlbumFormInput,
  media: MediaAlbum = {},
): Promise<{ id: number }> {
  const user = await requirePermission(GALERI_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const slug = await slugAlbumBebas(villageId, input.nama, null);
  const sampul = media.sampul
    ? await simpanBerkasMedia(villageId, media.sampul, "galeri", "sampul")
    : null;

  try {
    const id = await insertAlbum(villageId, slug, {
      nama: input.nama,
      keterangan: input.keterangan === "" ? null : input.keterangan,
      sampul,
      aktif: input.aktif,
      urut: input.urut,
    });
    return { id };
  } catch (error) {
    if (sampul) await hapusMedia(sampul);
    throw error;
  }
}

export async function updateAlbum(
  id: number,
  input: AlbumFormInput,
  media: MediaAlbum = {},
): Promise<void> {
  const user = await requirePermission(GALERI_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const lama = await getAlbumAdmin(villageId, id);
  if (!lama) throw notFound("Album galeri tidak ditemukan.");

  const slug = await slugAlbumBebas(villageId, input.nama, id);
  const sampulBaru = media.sampul
    ? await simpanBerkasMedia(villageId, media.sampul, "galeri", "sampul")
    : null;
  const sampul = sampulBaru ?? lama.sampul;

  try {
    await updateAlbumRow(id, slug, {
      nama: input.nama,
      keterangan: input.keterangan === "" ? null : input.keterangan,
      sampul,
      aktif: input.aktif,
      urut: input.urut,
    });
  } catch (error) {
    if (sampulBaru) await hapusMedia(sampulBaru);
    throw error;
  }

  if (lama.sampul && lama.sampul !== sampul) await hapusMedia(lama.sampul);
}

/**
 * Hapus album beserta seluruh fotonya.
 *
 * Baris foto terhapus lewat FK `cascade`, tetapi berkas di disk harus
 * dibersihkan manual — jalurnya dikumpulkan **sebelum** baris dihapus.
 */
export async function deleteAlbum(id: number): Promise<void> {
  const user = await requirePermission(GALERI_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const album = await getAlbumAdmin(villageId, id);
  if (!album) throw notFound("Album galeri tidak ditemukan.");

  const jalurFoto = await listJalurFotoAlbum(villageId, id);
  await deleteAlbumRow(id);

  await Promise.all(jalurFoto.map((jalur) => hapusMedia(jalur)));
  if (album.sampul) await hapusMedia(album.sampul);
}

/**
 * Unggah beberapa foto sekaligus ke satu album.
 *
 * Berkas yang tidak valid dilewati (dikembalikan alasannya) tanpa membatalkan
 * berkas lain, sehingga operator tidak perlu mengulang seluruh unggahan.
 */
export async function unggahFoto(
  albumId: number,
  berkas: BerkasUnggahan[],
): Promise<HasilUnggahFoto> {
  const user = await requirePermission(GALERI_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!(await getAlbumAdmin(villageId, albumId))) {
    throw notFound("Album galeri tidak ditemukan.");
  }
  if (berkas.length === 0) throw validationError("Pilih minimal satu foto.");
  if (berkas.length > MAKS_FOTO_PER_UNGGAH) {
    throw validationError(`Maksimal ${MAKS_FOTO_PER_UNGGAH} foto sekali unggah.`);
  }

  const hasil: HasilUnggahFoto = { tersimpan: 0, dilewati: [] };
  let urut = await urutFotoBerikutnya(villageId, albumId);

  for (const item of berkas) {
    if (!item.mime?.startsWith("image/")) {
      hasil.dilewati.push({ nama: item.nama, alasan: "Bukan berkas gambar." });
      continue;
    }

    let jalur: string | null = null;
    try {
      jalur = await simpanBerkasMedia(villageId, item, "galeri", "foto");
      await insertFoto(villageId, albumId, jalur, {
        judul: null,
        keterangan: null,
        urut,
        aktif: true,
        slider: false,
      });
      urut += 1;
      hasil.tersimpan += 1;
    } catch (error) {
      if (jalur) await hapusMedia(jalur);
      hasil.dilewati.push({
        nama: item.nama,
        alasan: error instanceof Error ? error.message : "Gagal menyimpan foto.",
      });
    }
  }

  return hasil;
}

/** Perbarui metadata foto (judul, keterangan, urutan, status, slider). */
export async function updateFoto(id: number, input: FotoFormInput): Promise<void> {
  const user = await requirePermission(GALERI_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!(await getFotoAdmin(villageId, id))) {
    throw notFound("Foto galeri tidak ditemukan.");
  }

  await updateFotoRow(id, {
    judul: input.judul === "" ? null : input.judul,
    keterangan: input.keterangan === "" ? null : input.keterangan,
    urut: input.urut,
    aktif: input.aktif,
    slider: input.slider,
  });
}

/** Hapus satu foto beserta berkasnya. */
export async function deleteFoto(id: number): Promise<void> {
  const user = await requirePermission(GALERI_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const foto = await getFotoAdmin(villageId, id);
  if (!foto) throw notFound("Foto galeri tidak ditemukan.");

  await deleteFotoRow(id);
  await hapusMedia(foto.gambar);
}
