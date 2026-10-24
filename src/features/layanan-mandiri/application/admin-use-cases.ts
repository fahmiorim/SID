import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  parseBerkasSyarat,
  type BerkasSyarat,
} from "@/features/layanan-mandiri/domain/layanan-mandiri";
import {
  getPermohonan,
  kembalikanPermohonan,
  listPermohonan,
  prosesPermohonan,
  tautkanSuratPermohonan,
} from "@/features/layanan-mandiri/infrastructure/layanan-mandiri-repository";
import { RESOURCES } from "@/features/rbac/domain/resources";
import {
  ajukanVerifikasiSuratData,
  createSuratDraftData,
} from "@/features/surat/application/surat-use-cases";
import { parseNilaiIsian } from "@/features/surat/domain/isian";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";

/** Daftar permohonan untuk operator (sudah tersaring desa sesi). */
export async function getPermohonanAdminData() {
  const user = await requirePermission(RESOURCES.permohonanSurat, "read");
  const villageId = await resolveVillageId(user);
  return listPermohonan(villageId);
}

/** Berkas syarat milik permohonan, untuk route unduhan operator. */
export async function getBerkasSyaratAdminData(
  permohonanId: number,
  syaratId: number,
): Promise<BerkasSyarat> {
  const user = await requirePermission(RESOURCES.permohonanSurat, "read");
  const villageId = await resolveVillageId(user);
  const permohonan = await getPermohonan(villageId, permohonanId);

  if (!permohonan) throw notFound("Permohonan tidak ditemukan.");
  const item = parseBerkasSyarat(permohonan.syarat).find((row) => row.id === syaratId);
  if (!item) throw notFound("Berkas syarat tidak ditemukan.");
  return item;
}

/**
 * Buat konsep surat dari permohonan, hubungkan, lalu ajukan verifikasi.
 *
 * Surat tetap melewati alur verifikasi operator → sekdes → kades yang sudah
 * ada. Permohonan berstatus 2 selama surat menunggu verifikasi, lalu berubah
 * menjadi 3 saat Kades menerbitkan (lihat sinkronisasi di use case persuratan).
 */
export async function buatKonsepSuratPermohonanData(permohonanId: number): Promise<{ id: number }> {
  const user = await requirePermission(RESOURCES.permohonanSurat, "update");
  const villageId = await resolveVillageId(user);
  const permohonan = await getPermohonan(villageId, permohonanId);

  if (!permohonan) throw notFound("Permohonan tidak ditemukan.");
  if (permohonan.status !== 1) {
    throw conflict("Konsep surat hanya dapat dibuat saat permohonan sedang diperiksa.");
  }
  if (permohonan.letterId !== null) {
    throw conflict("Permohonan ini sudah memiliki surat.");
  }

  const isiSurat = parseNilaiIsian(permohonan.isianForm);
  const purpose =
    permohonan.keterangan?.trim() ||
    `Permohonan surat ${permohonan.noAntrian ?? `#${permohonan.id}`}`;

  const surat = await createSuratDraftData({
    typeId: permohonan.letterTypeId,
    residentId: permohonan.residentId,
    letterDate: new Date().toISOString().slice(0, 10),
    purpose: purpose.slice(0, 255),
    isiSurat,
  });

  await tautkanSuratPermohonan(villageId, permohonan.id, surat.id);
  // Jalur permohonan tidak butuh konfirmasi syarat ulang: warga sudah wajib
  // mengunggah semua berkas syarat sebelum permohonan bisa diperiksa.
  await ajukanVerifikasiSuratData(surat.id, true);

  return surat;
}

/** Ubah status permohonan dengan validasi transisi di domain/repository. */
export async function ubahStatusPermohonanData(
  id: number,
  status: number,
  alasan = "",
): Promise<void> {
  const user = await requirePermission(RESOURCES.permohonanSurat, "update");
  const villageId = await resolveVillageId(user);

  if ((status === 0 || status === 5) && alasan.trim() === "") {
    throw validationError("Alasan wajib diisi saat mengembalikan atau membatalkan permohonan.");
  }

  await prosesPermohonan(villageId, id, status, alasan.trim() || undefined);
}

/** Kembalikan permohonan ke status 0 dengan alasan. */
export async function kembalikanPermohonanAdminData(id: number, alasan: string): Promise<void> {
  const user = await requirePermission(RESOURCES.permohonanSurat, "update");
  const villageId = await resolveVillageId(user);

  if (alasan.trim() === "") {
    throw validationError("Alasan wajib diisi.");
  }

  await kembalikanPermohonan(villageId, id, alasan.trim());
}
