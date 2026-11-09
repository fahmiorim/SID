import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  getMediaSettings,
  validasiMediaDenganPengaturan,
} from "@/features/kebijakan-berkas/domain/pengaturan-berkas";
import {
  dokumenWargaSchema,
  type DokumenWargaDTO,
} from "@/features/layanan-mandiri/domain/dokumen-warga";
import {
  parseBerkasSyarat,
  serializeBerkasSyarat,
  type BerkasSyarat,
  type JenisSuratWarga,
} from "@/features/layanan-mandiri/domain/layanan-mandiri";
import {
  createDokumenWarga,
  deleteDokumenWarga,
  findDokumenWarga,
  keDTO,
  listDokumenWarga,
  updateDokumenWarga,
} from "@/features/layanan-mandiri/infrastructure/dokumen-warga-repository";
import {
  batalkanPermohonanWarga,
  buatPermohonan,
  getPermohonanWarga,
  getSuratUntukWarga,
  listPermohonanWarga,
  listSuratUntukWarga,
} from "@/features/layanan-mandiri/infrastructure/layanan-mandiri-repository";
import { simpanBerkasMedia } from "@/features/publik/application/simpan-berkas-media";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import { bacaMedia, hapusMedia } from "@/features/publik/infrastructure/media-storage";
import {
  buildIsianValues,
  isianErrorsToFieldErrors,
  parseIsianFields,
  validateIsianValues,
} from "@/features/surat/domain/isian";
import { requireWarga, requireWargaAktif } from "@/lib/dal";
import { forbidden, notFound, validationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/** Semua jenis surat aktif yang dapat diajukan warga. */
export async function listJenisSuratWargaData(): Promise<JenisSuratWarga[]> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  return listSuratUntukWarga(villageId);
}

/** Satu jenis surat aktif; `null` bila tidak ada/tidak aktif di desa ini. */
export async function getJenisSuratWargaData(
  letterTypeId: number,
): Promise<JenisSuratWarga | null> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  return getSuratUntukWarga(villageId, letterTypeId);
}

/** Riwayat permohonan milik warga yang sedang login. */
export async function listPermohonanWargaData() {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  return listPermohonanWarga(villageId, user.residentId);
}

export interface AjukanSuratWargaInput {
  letterTypeId: number;
  isian: Readonly<Record<string, string>>;
  noHpAktif: string;
  keterangan: string;
  /** Berkas per id syarat. */
  berkas: ReadonlyMap<number, BerkasUnggahan>;
}

/**
 * Ajukan surat atas nama warga yang sedang login.
 *
 * `residentId` tidak pernah diterima dari input. Syarat diambil dari master
 * jenis surat, divalidasi lengkap, lalu disimpan di media privat.
 */
export async function ajukanSuratWargaData(
  input: AjukanSuratWargaInput,
): Promise<{ id: number; noAntrian: string }> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);

  const jenis = await getSuratUntukWarga(villageId, input.letterTypeId);
  if (!jenis) throw notFound("Jenis surat tidak ditemukan atau sedang tidak aktif.");

  const fields = parseIsianFields(jenis.formIsian);
  const values = buildIsianValues(fields, input.isian);
  const errors = validateIsianValues(fields, values);
  if (Object.keys(errors).length > 0) {
    throw validationError(
      "Lengkapi isian surat yang wajib diisi.",
      isianErrorsToFieldErrors(errors),
    );
  }

  if (input.noHpAktif.trim().length > 30) {
    throw validationError("Nomor HP maksimal 30 karakter.", {
      noHpAktif: ["Nomor HP maksimal 30 karakter."],
    });
  }

  if (input.keterangan.trim().length > 500) {
    throw validationError("Keterangan maksimal 500 karakter.", {
      keterangan: ["Keterangan maksimal 500 karakter."],
    });
  }

  // Wajib mengunggah semua syarat yang tercantum pada jenis surat. Batas
  // MIME/ukuran mengikuti pengaturan lampiran terpusat kategori "permohonan"
  // sehingga operator dapat menyesuaikannya tanpa mengubah kode.
  const pengaturanBerkas = await getMediaSettings(villageId, "permohonan");

  for (const syarat of jenis.syarat) {
    const berkas = input.berkas.get(syarat.id);
    if (!berkas || berkas.ukuran === 0) {
      throw validationError(`Berkas syarat "${syarat.nama}" wajib diunggah.`, {
        [`syarat.${syarat.id}`]: [`Berkas syarat "${syarat.nama}" wajib diunggah.`],
      });
    }

    const pesan = validasiMediaDenganPengaturan(pengaturanBerkas, berkas.mime, berkas.ukuran);
    if (pesan) {
      throw validationError(`Berkas syarat "${syarat.nama}" tidak valid: ${pesan}`, {
        [`syarat.${syarat.id}`]: [pesan],
      });
    }
  }

  const berkasTersimpan: BerkasSyarat[] = [];
  for (const syarat of jenis.syarat) {
    const berkas = input.berkas.get(syarat.id);
    if (!berkas) continue;

    const jalur = await simpanBerkasMedia(villageId, berkas, "permohonan", `syarat.${syarat.id}`);

    berkasTersimpan.push({
      id: syarat.id,
      nama: syarat.nama,
      berkas: jalur,
      mime: berkas.mime ?? "application/octet-stream",
      namaAsli: berkas.nama.slice(0, 200),
    });
  }

  const noAntrian = `AN-${Date.now()}`;
  const id = await buatPermohonan({
    villageId,
    residentId: user.residentId,
    letterTypeId: jenis.id,
    isianForm: JSON.stringify(values),
    noHpAktif: input.noHpAktif.trim(),
    keterangan: input.keterangan.trim(),
    syarat: serializeBerkasSyarat(berkasTersimpan),
    noAntrian,
  });

  if (!id) throw new Error("Gagal menyimpan permohonan.");
  return { id, noAntrian };
}

/** Berkas syarat milik permohonan warga; dipakai route unduhan privat. */
export async function getBerkasSyaratWargaData(
  permohonanId: number,
  syaratId: number,
): Promise<BerkasSyarat> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const permohonan = await getPermohonanWarga(villageId, user.residentId, permohonanId);

  if (!permohonan) throw notFound("Permohonan tidak ditemukan.");
  const item = parseBerkasSyarat(permohonan.syarat).find((row) => row.id === syaratId);
  if (!item) throw notFound("Berkas syarat tidak ditemukan.");
  return item;
}

/** Isi berkas syarat milik warga untuk route unduhan privat. */
export async function bacaBerkasSyaratWarga(
  permohonanId: number,
  syaratId: number,
): Promise<{ isi: Buffer; mime: string; namaAsli: string }> {
  const berkas = await getBerkasSyaratWargaData(permohonanId, syaratId);
  const isi = await bacaMedia(berkas.berkas);
  return { isi, mime: berkas.mime, namaAsli: berkas.namaAsli };
}

/** Batalkan permohonan milik warga selama belum diambil. */
export async function batalkanPermohonanWargaData(
  permohonanId: number,
  alasan = "",
): Promise<void> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);

  if (!alasan.trim()) {
    throw validationError("Alasan pembatalan wajib diisi.");
  }

  await batalkanPermohonanWarga(villageId, user.residentId, permohonanId, alasan.trim());
}

// --- Arsip dokumen pribadi warga (OS-WGA-005) -----------------------------

/** Daftar dokumen pribadi milik warga yang sedang login. */
export async function daftarDokumenWargaData(): Promise<DokumenWargaDTO[]> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  const rows = await listDokumenWarga(villageId, user.residentId);
  return rows.map(keDTO);
}

/**
 * Unggah dokumen pribadi baru.
 *
 * Berkas disimpan di media privat (kategori `permohonan`) sehingga tidak dapat
 * diunduh tanpa sesi pemilik. Batas MIME/ukuran mengikuti pengaturan lampiran
 * desa untuk kategori tersebut.
 */
export async function unggahDokumenWargaData(input: {
  jenis: unknown;
  nama: unknown;
  berkas: BerkasUnggahan | null;
}): Promise<{ id: number }> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const parsed = dokumenWargaSchema.parse({ jenis: input.jenis, nama: input.nama });

  if (!input.berkas || input.berkas.ukuran === 0) {
    throw validationError("Berkas dokumen wajib diunggah.", {
      berkas: ["Pilih berkas dokumen yang akan diunggah."],
    });
  }

  const pengaturan = await getMediaSettings(villageId, "permohonan");
  const pesan = validasiMediaDenganPengaturan(pengaturan, input.berkas.mime, input.berkas.ukuran);
  if (pesan) {
    throw validationError(`Berkas dokumen tidak valid: ${pesan}`, { berkas: [pesan] });
  }

  const jalur = await simpanBerkasMedia(villageId, input.berkas, "permohonan", "berkas");
  const id = await createDokumenWarga({
    villageId,
    residentId: user.residentId,
    jenis: parsed.jenis,
    nama: parsed.nama,
    berkas: jalur,
    mime: input.berkas.mime ?? "application/octet-stream",
    namaAsli: input.berkas.nama.slice(0, 255),
    sumber: "warga",
  });

  return { id };
}

/** Ubah jenis/nama dokumen; hanya unggahan warga sendiri. */
export async function ubahDokumenWargaData(
  id: number,
  input: { jenis: unknown; nama: unknown },
): Promise<void> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const dokumen = await findDokumenWarga(villageId, user.residentId, id);

  if (!dokumen) throw notFound("Dokumen tidak ditemukan.");
  if (dokumen.sumber !== "warga") {
    throw forbidden("Dokumen yang diunggah operator tidak dapat diubah.");
  }

  const parsed = dokumenWargaSchema.parse(input);
  await updateDokumenWarga(villageId, user.residentId, id, parsed);
}

/** Hapus dokumen milik sendiri beserta berkas prismanya. */
export async function hapusDokumenWargaData(id: number): Promise<void> {
  const user = await requireWargaAktif();
  const villageId = await resolveVillageId(user);
  const dokumen = await findDokumenWarga(villageId, user.residentId, id);

  if (!dokumen) throw notFound("Dokumen tidak ditemukan.");
  if (dokumen.sumber !== "warga") {
    throw forbidden("Dokumen yang diunggah operator tidak dapat dihapus.");
  }

  await deleteDokumenWarga(villageId, user.residentId, id);

  try {
    await hapusMedia(dokumen.berkas);
  } catch (error) {
    logger.warn("Gagal menghapus berkas dokumen warga", { error, dokumenId: id });
  }
}

/** Berkas dokumen untuk route unduhan ber-otentikasi; pemilik saja. */
export async function getBerkasDokumenWargaData(id: number) {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  const dokumen = await findDokumenWarga(villageId, user.residentId, id);

  if (!dokumen) throw notFound("Dokumen tidak ditemukan.");
  return dokumen;
}

/** Isi dokumen warga untuk route unduhan privat; pemilik saja. */
export async function bacaBerkasDokumenWarga(
  id: number,
): Promise<{ isi: Buffer; mime: string; namaAsli: string }> {
  const dokumen = await getBerkasDokumenWargaData(id);
  const isi = await bacaMedia(dokumen.berkas);
  return { isi, mime: dokumen.mime, namaAsli: dokumen.namaAsli };
}
