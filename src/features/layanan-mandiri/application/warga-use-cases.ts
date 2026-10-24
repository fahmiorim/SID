import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  parseBerkasSyarat,
  serializeBerkasSyarat,
  type BerkasSyarat,
  type JenisSuratWarga,
} from "@/features/layanan-mandiri/domain/layanan-mandiri";
import {
  buatPermohonan,
  getPermohonanWarga,
  getSuratUntukWarga,
  listPermohonanWarga,
  listSuratUntukWarga,
} from "@/features/layanan-mandiri/infrastructure/layanan-mandiri-repository";
import { simpanBerkasMedia } from "@/features/publik/application/simpan-berkas-media";
import { validasiBerkasSyarat, type BerkasUnggahan } from "@/features/publik/domain/media";
import {
  buildIsianValues,
  isianErrorsToFieldErrors,
  parseIsianFields,
  validateIsianValues,
} from "@/features/surat/domain/isian";
import { requireWarga, requireWargaAktif } from "@/lib/dal";
import { notFound, validationError } from "@/lib/errors";

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

  // Wajib mengunggah semua syarat yang tercantum pada jenis surat.
  for (const syarat of jenis.syarat) {
    const berkas = input.berkas.get(syarat.id);
    if (!berkas || berkas.ukuran === 0) {
      throw validationError(`Berkas syarat "${syarat.nama}" wajib diunggah.`, {
        [`syarat.${syarat.id}`]: [`Berkas syarat "${syarat.nama}" wajib diunggah.`],
      });
    }

    const valid = validasiBerkasSyarat(berkas.mime, berkas.ukuran);
    if (!valid.ok) {
      throw validationError(`Berkas syarat "${syarat.nama}" tidak valid: ${valid.pesan}`, {
        [`syarat.${syarat.id}`]: [valid.pesan],
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
