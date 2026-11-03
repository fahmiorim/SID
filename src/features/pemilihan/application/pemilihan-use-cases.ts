import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { PEMILIHAN_RESOURCE, pemilihanSchema } from "../domain/pemilihan";
import {
  createPemilihan,
  deletePemilihan,
  getAktifPemilihan,
  listPemilihan,
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
