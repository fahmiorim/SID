import "server-only";

import { listDpt } from "@/features/penduduk/infrastructure/dpt-repository";
import { requirePermission } from "@/lib/dal";
import { AppError, conflict } from "@/lib/errors";

import {
  hitungRekapSuara,
  kandidatSchema,
  PEMILIHAN_RESOURCE,
  pemilihanSchema,
  type KandidatDTO,
  type RekapSuara,
} from "../domain/pemilihan";
import {
  createKandidat,
  createPemilihan,
  deleteKandidat,
  deletePemilihan,
  findKandidat,
  getAktifPemilihan,
  getPemilihanById,
  listKandidat,
  listPemilihan,
  nomorUrutDipakai,
  updateKandidat,
  updatePemilihan,
} from "../infrastructure/pemilihan-repository";

export async function daftarPemilihan(villageId: number) {
  await requirePermission(PEMILIHAN_RESOURCE, "read");
  const rows = await listPemilihan(villageId);
  return rows.map((row) => ({
    ...row,
    tanggal: row.tanggal ? new Date(row.tanggal).toISOString().slice(0, 10) : null,
  }));
}

export async function daftarTahunPemilihan(villageId: number) {
  await requirePermission(PEMILIHAN_RESOURCE, "read");
  const items = await listPemilihan(villageId);
  return [...new Set(items.map((item) => item.tahun))].sort((a, b) => Number(a) - Number(b));
}

export async function getPemilihanAktif(villageId: number) {
  await requirePermission(PEMILIHAN_RESOURCE, "read");
  return getAktifPemilihan(villageId);
}

export async function simpanPemilihan(villageId: number, input: unknown) {
  await requirePermission(PEMILIHAN_RESOURCE, "update");
  const parsed = pemilihanSchema.parse(input);
  return await createPemilihan(villageId, {
    tahun: parsed.tahun,
    jenis: parsed.jenis,
    tanggal: parsed.tanggal || null,
    keterangan: parsed.keterangan || null,
  });
}

export async function ubahPemilihan(villageId: number, id: number, input: unknown) {
  await requirePermission(PEMILIHAN_RESOURCE, "update");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID pemilihan tidak valid.");
  const parsed = pemilihanSchema.parse(input);
  await updatePemilihan(id, villageId, {
    tahun: parsed.tahun,
    jenis: parsed.jenis,
    tanggal: parsed.tanggal || null,
    keterangan: parsed.keterangan || null,
  });
}

export async function hapusPemilihan(villageId: number, id: number) {
  await requirePermission(PEMILIHAN_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID pemilihan tidak valid.");
  await deletePemilihan(id, villageId);
}

/** Data kandidat + rekap suara + jumlah DPT sebuah pemilihan. */
export interface KandidatData {
  kandidat: KandidatDTO[];
  rekap: RekapSuara;
  dptTotal: number;
}

/** Pastikan pemilihan ada di desa pengguna. */
async function requirePemilihan(villageId: number, pemilihanId: number) {
  if (!Number.isInteger(pemilihanId) || pemilihanId < 1) {
    throw new AppError("NOT_FOUND", "ID pemilihan tidak valid.");
  }
  const row = await getPemilihanById(villageId, pemilihanId);
  if (!row) throw new AppError("NOT_FOUND", "Pemilihan tidak ditemukan.");
  return row;
}

/**
 * Kandidat, rekap suara, dan jumlah daftar pemilih (DPT) sebuah pemilihan.
 *
 * DPT memakai pemilihan aktif pada modul kependudukan; bila belum ada
 * pemilihan aktif, jumlahnya 0 (bukan galat) agar halaman tetap tampil.
 */
export async function daftarKandidat(
  villageId: number,
  pemilihanId: number,
): Promise<KandidatData> {
  await requirePermission(PEMILIHAN_RESOURCE, "read");
  await requirePemilihan(villageId, pemilihanId);

  const [kandidat, dpt] = await Promise.all([
    listKandidat(villageId, pemilihanId),
    listDpt(villageId, { page: 1, perPage: 1 }),
  ]);

  return { kandidat, rekap: hitungRekapSuara(kandidat), dptTotal: dpt.total };
}

/** Simpan kandidat (tambah bila `id` kosong, ubah bila ada). */
export async function simpanKandidat(
  villageId: number,
  pemilihanId: number,
  input: unknown,
  id?: number | null,
): Promise<number> {
  await requirePermission(PEMILIHAN_RESOURCE, "update");
  await requirePemilihan(villageId, pemilihanId);

  const parsed = kandidatSchema.parse(input);

  if (id) {
    const existing = await findKandidat(villageId, id);
    if (!existing || existing.pemilihanId !== pemilihanId) {
      throw new AppError("NOT_FOUND", "Kandidat tidak ditemukan pada pemilihan ini.");
    }
  }

  if (await nomorUrutDipakai(villageId, pemilihanId, parsed.nomorUrut, id ?? null)) {
    throw conflict(`Nomor urut ${parsed.nomorUrut} sudah dipakai kandidat lain.`);
  }

  const values = {
    nomorUrut: parsed.nomorUrut,
    nama: parsed.nama,
    keterangan: parsed.keterangan || null,
    jumlahSuara: parsed.jumlahSuara,
  };

  if (id) {
    await updateKandidat(villageId, id, values);
    return id;
  }

  return createKandidat(villageId, pemilihanId, values);
}

/** Hapus kandidat (scoped desa). */
export async function hapusKandidat(villageId: number, id: number): Promise<void> {
  await requirePermission(PEMILIHAN_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID kandidat tidak valid.");

  const existing = await findKandidat(villageId, id);
  if (!existing) throw new AppError("NOT_FOUND", "Kandidat tidak ditemukan.");

  await deleteKandidat(villageId, id);
}
