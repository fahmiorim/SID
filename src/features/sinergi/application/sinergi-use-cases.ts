import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { SINERGI_RESOURCE, sinergiSchema, type SinergiInput } from "../domain/sinergi";
import {
  createSinergi,
  deleteSinergi,
  listSinergi,
  updateSinergi,
} from "../infrastructure/sinergi-repository";

/** Ubah isian formulir (string kosong) menjadi nilai kolom yang bersih. */
function nilaiKolom(parsed: SinergiInput) {
  return {
    nama: parsed.nama,
    mitra: parsed.mitra || null,
    tahun: parsed.tahun ?? null,
    tanggalMulai: parsed.tanggalMulai || null,
    tanggalSelesai: parsed.tanggalSelesai || null,
    keterangan: parsed.keterangan || null,
  };
}

export async function daftarSinergi(villageId: number) {
  await requirePermission(SINERGI_RESOURCE, "read");
  return listSinergi(villageId);
}

export async function tambahSinergi(villageId: number, input: unknown) {
  await requirePermission(SINERGI_RESOURCE, "update");
  const parsed = sinergiSchema.parse(input);
  const id = await createSinergi({ villageId, ...nilaiKolom(parsed) });
  return { id };
}

export async function ubahSinergi(villageId: number, id: number, input: unknown) {
  await requirePermission(SINERGI_RESOURCE, "update");
  const parsed = sinergiSchema.parse(input);
  await updateSinergi(id, villageId, nilaiKolom(parsed));
}

export async function hapusSinergi(villageId: number, id: number) {
  await requirePermission(SINERGI_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deleteSinergi(id, villageId);
}
