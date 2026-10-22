import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { validasiMedia } from "@/features/publik/domain/media";
import { hapusMedia, simpanUnggahanMedia } from "@/features/publik/infrastructure/media-storage";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";
import { sanitasiHtml } from "@/lib/sanitize";

import {
  BERITA_KATEGORI_RESOURCE,
  BERITA_RESOURCE,
  slugBerita,
  slugKategoriBerita,
  tanggalTerbitEfektif,
  type BeritaAdminDetail,
  type BeritaAdminListResult,
  type BeritaFormInput,
  type KategoriBeritaFormInput,
  type KategoriBeritaOption,
  type KategoriBeritaRow,
} from "../domain/berita";
import {
  deleteBerita as deleteBeritaRow,
  deleteKategori as deleteKategoriRow,
  getBeritaAdmin,
  insertBerita,
  insertKategori,
  kategoriMilikDesa,
  listBeritaAdmin,
  listKategoriBeritaAdmin,
  listKategoriBeritaOption,
  slugBeritaDipakai,
  slugKategoriDipakai,
  updateBerita as updateBeritaRow,
  updateKategori as updateKategoriRow,
  type BeritaSimpan,
} from "../infrastructure/berita-repository";

/**
 * Use case konten berita (Fase 1F.2).
 *
 * Setiap fungsi memeriksa izin lewat `requirePermission` dan mengambil desa
 * dari sesi (`resolveVillageId`) — tidak pernah dari input klien. Aturan yang
 * lintas-data ditegakkan di sini: slug unik per desa, kategori harus milik desa
 * yang sama, isi disanitasi sebelum disimpan, dan berkas media dibersihkan saat
 * diganti/dihapus.
 */

export interface ListBeritaParams {
  search: string;
  status: string;
  page: number;
  pageSize?: number;
}

export async function listBerita(params: ListBeritaParams): Promise<BeritaAdminListResult> {
  const user = await requirePermission(BERITA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listBeritaAdmin({ villageId, ...params });
}

export async function getBerita(id: number): Promise<BeritaAdminDetail> {
  const user = await requirePermission(BERITA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const berita = await getBeritaAdmin(villageId, id);
  if (!berita) throw notFound("Berita tidak ditemukan.");

  return berita;
}

export async function getKategoriOptions(): Promise<KategoriBeritaOption[]> {
  const user = await requirePermission(BERITA_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listKategoriBeritaOption(villageId);
}

/* -------------------------------------------------------------------------- */
/* Berita                                                                     */
/* -------------------------------------------------------------------------- */

/** Cari slug berita yang bebas untuk desa ini. */
async function slugBeritaBebas(
  villageId: number,
  judul: string,
  kecualiId: number | null,
): Promise<string> {
  const dasar = slugBerita(judul);

  for (let urutan = 1; urutan <= 200; urutan += 1) {
    const kandidat = urutan === 1 ? dasar : `${dasar}-${urutan}`;
    if (!(await slugBeritaDipakai(villageId, kandidat, kecualiId))) return kandidat;
  }

  throw conflict("Tidak dapat membentuk slug berita yang unik.");
}

/** Kategori pilihan harus milik desa yang sama. */
async function pastikanKategori(villageId: number, kategoriId: number | null): Promise<void> {
  if (kategoriId === null) return;

  if (!(await kategoriMilikDesa(villageId, kategoriId))) {
    throw validationError("Kategori berita tidak tersedia.", {
      kategoriId: ["Kategori tidak ditemukan di desa ini."],
    });
  }
}

/**
 * Susun nilai yang disimpan: sanitasi HTML, normalkan teks kosong, dan hitung
 * tanggal terbit efektif.
 */
function siapkanSimpan(
  input: BeritaFormInput,
  media: { gambar: string | null; dokumen: string | null },
  sekarang: Date = new Date(),
): BeritaSimpan {
  const isi = sanitasiHtml(input.isi);
  if (!isi.trim()) {
    throw validationError("Isi berita tidak valid setelah dibersihkan.", {
      isi: ["Isi berita wajib diisi dengan teks atau markup yang diizinkan."],
    });
  }

  return {
    judul: input.judul,
    kategoriId: input.kategoriId,
    ringkasan: input.ringkasan === "" ? null : input.ringkasan,
    isi,
    status: input.status,
    terbitPada: tanggalTerbitEfektif(input.status, input.terbitPada, sekarang),
    headline: input.headline,
    slider: input.slider,
    bolehKomentar: input.bolehKomentar,
    gambar: media.gambar,
    dokumen: media.dokumen,
  };
}

/** Berkas unggahan yang sudah dibaca dari `FormData` oleh Server Action. */
export interface BerkasUnggahan {
  nama: string;
  mime: string | null;
  ukuran: number;
  isi: Uint8Array;
}

/** Berkas baru yang menyertai penyimpanan berita; kosong = pertahankan yang lama. */
export interface MediaBerita {
  gambar?: BerkasUnggahan | null;
  dokumen?: BerkasUnggahan | null;
}

/** Validasi, simpan, dan kembalikan jalur relatif berkas media. */
async function simpanBerkas(
  villageId: number,
  berkas: BerkasUnggahan,
  kategori: "berita" | "dokumen",
  namaField: "gambar" | "dokumen",
): Promise<string> {
  const validasi = validasiMedia(berkas.mime, berkas.ukuran);
  if (!validasi.ok) {
    throw validationError(validasi.pesan, { [namaField]: [validasi.pesan] });
  }

  const hasil = await simpanUnggahanMedia(villageId, kategori, {
    nama: berkas.nama,
    mime: berkas.mime,
    ukuran: berkas.ukuran,
    isi: berkas.isi,
  });

  return hasil.jalur;
}

export async function createBerita(
  input: BeritaFormInput,
  media: MediaBerita = {},
): Promise<{ id: number }> {
  const user = await requirePermission(BERITA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  await pastikanKategori(villageId, input.kategoriId);

  const slug = await slugBeritaBebas(villageId, input.judul, null);

  const gambar = media.gambar
    ? await simpanBerkas(villageId, media.gambar, "berita", "gambar")
    : null;
  const dokumen = media.dokumen
    ? await simpanBerkas(villageId, media.dokumen, "dokumen", "dokumen")
    : null;

  try {
    const id = await insertBerita(
      villageId,
      user.id,
      slug,
      siapkanSimpan(input, { gambar, dokumen }),
    );
    return { id };
  } catch (error) {
    // Jangan tinggalkan berkas yatim bila penyimpanan baris gagal.
    if (gambar) await hapusMedia(gambar);
    if (dokumen) await hapusMedia(dokumen);
    throw error;
  }
}

export async function updateBerita(
  id: number,
  input: BeritaFormInput,
  media: MediaBerita = {},
): Promise<void> {
  const user = await requirePermission(BERITA_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const lama = await getBeritaAdmin(villageId, id);
  if (!lama) throw notFound("Berita tidak ditemukan.");

  await pastikanKategori(villageId, input.kategoriId);

  const slug = await slugBeritaBebas(villageId, input.judul, id);

  const gambarBaru = media.gambar
    ? await simpanBerkas(villageId, media.gambar, "berita", "gambar")
    : null;
  const dokumenBaru = media.dokumen
    ? await simpanBerkas(villageId, media.dokumen, "dokumen", "dokumen")
    : null;

  const gambar = gambarBaru ?? lama.gambar;
  const dokumen = dokumenBaru ?? lama.dokumen;

  try {
    await updateBeritaRow(id, slug, siapkanSimpan(input, { gambar, dokumen }));
  } catch (error) {
    if (gambarBaru) await hapusMedia(gambarBaru);
    if (dokumenBaru) await hapusMedia(dokumenBaru);
    throw error;
  }

  // Berkas lama yang sudah tidak dirujuk dibersihkan (best-effort).
  if (lama.gambar && lama.gambar !== gambar) await hapusMedia(lama.gambar);
  if (lama.dokumen && lama.dokumen !== dokumen) await hapusMedia(lama.dokumen);
}

export async function deleteBerita(id: number): Promise<void> {
  const user = await requirePermission(BERITA_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const lama = await getBeritaAdmin(villageId, id);
  if (!lama) throw notFound("Berita tidak ditemukan.");

  await deleteBeritaRow(id);

  if (lama.gambar) await hapusMedia(lama.gambar);
  if (lama.dokumen) await hapusMedia(lama.dokumen);
}

/* -------------------------------------------------------------------------- */
/* Kategori                                                                   */
/* -------------------------------------------------------------------------- */

export async function listKategori(): Promise<KategoriBeritaRow[]> {
  const user = await requirePermission(BERITA_KATEGORI_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listKategoriBeritaAdmin(villageId);
}

/** Slug kategori bebas untuk desa ini. */
async function slugKategoriBebas(
  villageId: number,
  nama: string,
  kecualiId: number | null,
): Promise<string> {
  const dasar = slugKategoriBerita(nama);

  for (let urutan = 1; urutan <= 200; urutan += 1) {
    const kandidat = urutan === 1 ? dasar : `${dasar}-${urutan}`;
    if (!(await slugKategoriDipakai(villageId, kandidat, kecualiId))) return kandidat;
  }

  throw conflict("Tidak dapat membentuk slug kategori yang unik.");
}

export async function createKategori(input: KategoriBeritaFormInput): Promise<{ id: number }> {
  const user = await requirePermission(BERITA_KATEGORI_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const slug = await slugKategoriBebas(villageId, input.nama, null);
  const id = await insertKategori(villageId, {
    nama: input.nama,
    slug,
    urut: input.urut,
    aktif: input.aktif,
  });

  return { id };
}

export async function updateKategori(id: number, input: KategoriBeritaFormInput): Promise<void> {
  const user = await requirePermission(BERITA_KATEGORI_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!(await kategoriMilikDesa(villageId, id))) {
    throw notFound("Kategori berita tidak ditemukan.");
  }

  const slug = await slugKategoriBebas(villageId, input.nama, id);
  await updateKategoriRow(id, {
    nama: input.nama,
    slug,
    urut: input.urut,
    aktif: input.aktif,
  });
}

export async function deleteKategori(id: number): Promise<void> {
  const user = await requirePermission(BERITA_KATEGORI_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  if (!(await kategoriMilikDesa(villageId, id))) {
    throw notFound("Kategori berita tidak ditemukan.");
  }

  // Berita yang memakai kategori ini menjadi tanpa kategori (FK `set null`),
  // bukan ikut terhapus.
  await deleteKategoriRow(id);
}
