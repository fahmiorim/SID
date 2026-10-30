import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { PEMILIHAN_RESOURCE } from "../domain/pemilihan";
import {
  createPemilihan,
  deletePemilihan,
  getAktifPemilihan,
  listPemilihan,
} from "../infrastructure/pemilihan-repository";

export async function daftarPemilihan(villageId: number) {
  await requirePermission(PEMILIHAN_RESOURCE, "read");
  return listPemilihan(villageId);
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

export async function simpanPemilihan(
  villageId: number,
  input: {
    tahun: number;
    jenis: string;
    tanggal?: string | null;
    keterangan?: string | null;
  },
) {
  await requirePermission(PEMILIHAN_RESOURCE, "update");
  return await createPemilihan(villageId, input);
}

export async function hapusPemilihan(villageId: number, id: number) {
  await requirePermission(PEMILIHAN_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID pemilihan tidak valid.");
  await deletePemilihan(id);
}
