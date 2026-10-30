import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { ANJUNGAN_RESOURCE, anjunganFormSchema } from "../domain/anjungan";
import {
  createAnjungan,
  deleteAnjungan,
  listAnjungan,
  updateAnjungan,
} from "../infrastructure/anjungan-repository";

export async function daftarAnjungan(villageId: number, aktifOnly = false) {
  await requirePermission(ANJUNGAN_RESOURCE, "read");
  return listAnjungan(villageId, aktifOnly);
}

export async function tambahAnjungan(villageId: number, input: unknown) {
  await requirePermission(ANJUNGAN_RESOURCE, "update");
  const parsed = anjunganFormSchema.parse(input);
  const id = await createAnjungan({
    villageId,
    nama: parsed.nama,
    deskripsi: parsed.deskripsi ?? null,
    aktif: parsed.aktif,
    urutan: parsed.urutan,
  });
  return { id };
}

export async function ubahAnjungan(villageId: number, id: number, input: unknown) {
  await requirePermission(ANJUNGAN_RESOURCE, "update");
  const parsed = anjunganFormSchema.parse(input);
  await updateAnjungan(id, villageId, {
    nama: parsed.nama,
    deskripsi: parsed.deskripsi ?? null,
    aktif: parsed.aktif,
    urutan: parsed.urutan,
  });
}

export async function hapusAnjungan(villageId: number, id: number) {
  await requirePermission(ANJUNGAN_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deleteAnjungan(id, villageId);
}
