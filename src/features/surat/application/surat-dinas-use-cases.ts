import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { validasiMedia, type BerkasUnggahan } from "@/features/publik/domain/media";
import {
  hapusMedia,
  simpanUnggahanMedia,
  type KategoriMedia,
} from "@/features/publik/infrastructure/media-storage";
import { SURAT_DINAS_RESOURCE, type SuratDinasInput } from "@/features/surat/domain/surat";
import { getKlasifikasi, listKlasifikasi } from "@/features/surat/infrastructure/master-repository";
import {
  createSuratDinas,
  deleteSuratDinas,
  getSuratDinas,
  listSuratDinas,
  updateSuratDinas,
} from "@/features/surat/infrastructure/surat-dinas-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

export async function listSuratDinasWithMeta(search: string) {
  const user = await requirePermission(SURAT_DINAS_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const [rows, classifications] = await Promise.all([
    listSuratDinas(villageId, search),
    listKlasifikasi(villageId),
  ]);

  return { rows, classifications };
}

/** Kategori tunggal untuk lampiran arsip surat dinas. */
const KATEGORI_DINAS: KategoriMedia = "umum";

/**
 * Simpan unggahan lampiran arsip dan kembalikan jalur media relatifnya.
 * Validasi MIME/ukuran mengikuti aturan media `umum`.
 */
async function tautkanArsip(villageId: number, berkas: BerkasUnggahan): Promise<string> {
  const validasi = validasiMedia(berkas.mime, berkas.ukuran);
  if (!validasi.ok) {
    throw conflict(validasi.pesan);
  }

  const hasil = await simpanUnggahanMedia(villageId, KATEGORI_DINAS, {
    nama: berkas.nama,
    mime: berkas.mime,
    ukuran: berkas.ukuran,
    isi: berkas.isi,
  });
  return hasil.jalur;
}

/** Klasifikasi (bila diisi) harus milik desa yang sama. */
async function pastikanKlasifikasi(villageId: number, id: number | null): Promise<void> {
  if (id === null) return;
  if (!(await getKlasifikasi(villageId, id))) {
    throw conflict("Klasifikasi surat tidak ditemukan.");
  }
}

export async function createSuratDinasData(
  input: SuratDinasInput,
  arsipBerkas?: BerkasUnggahan,
): Promise<{ id: number }> {
  const user = await requirePermission(SURAT_DINAS_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  await pastikanKlasifikasi(villageId, input.classificationId);

  if (arsipBerkas) {
    const jalur = await tautkanArsip(villageId, arsipBerkas);
    return { id: await createSuratDinas(villageId, { ...input, archiveFile: jalur }) };
  }

  return { id: await createSuratDinas(villageId, input) };
}

export async function updateSuratDinasData(
  id: number,
  input: SuratDinasInput,
  arsipBerkas?: BerkasUnggahan,
): Promise<void> {
  const user = await requirePermission(SURAT_DINAS_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const surat = await getSuratDinas(villageId, id);
  if (!surat) throw notFound("Surat dinas tidak ditemukan.");
  await pastikanKlasifikasi(villageId, input.classificationId);

  const parsed: SuratDinasInput = { ...input };
  const arsipLama = surat.archiveFile;

  if (arsipBerkas) {
    parsed.archiveFile = await tautkanArsip(villageId, arsipBerkas);
  } else if (input.hapusArsip) {
    parsed.archiveFile = "";
  }

  // Arsip lama dihapus dari penyimpanan setelah baris DB tergantikan.
  const memakaiLama = arsipLama && parsed.archiveFile === arsipLama;
  await updateSuratDinas(villageId, id, parsed);

  if (arsipLama && !memakaiLama && parsed.archiveFile !== arsipLama) {
    try {
      await hapusMedia(arsipLama);
    } catch {
      // Gagal membersihkan berkas fisik tidak perlu menggagalkan update.
    }
  }
}

export async function deleteSuratDinasData(id: number): Promise<void> {
  const user = await requirePermission(SURAT_DINAS_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const surat = await getSuratDinas(villageId, id);
  if (!surat) throw notFound("Surat dinas tidak ditemukan.");
  await deleteSuratDinas(villageId, id);

  if (surat.archiveFile) {
    try {
      await hapusMedia(surat.archiveFile);
    } catch {
      // Berkas bisa saja sudah hilang/berpindah; data tetap terhapus.
    }
  }
}
