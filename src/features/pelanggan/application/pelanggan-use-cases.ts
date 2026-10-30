import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { PELANGGAN_RESOURCE, pelangganFormSchema } from "../domain/pelanggan";
import {
  createPelanggan,
  deletePelanggan,
  listPelanggan,
  updatePelanggan,
} from "../infrastructure/pelanggan-repository";

export async function daftarPelanggan(villageId: number, opts?: { q?: string }) {
  await requirePermission(PELANGGAN_RESOURCE, "read");
  return listPelanggan(villageId, opts);
}

export async function tambahPelanggan(villageId: number, input: unknown) {
  await requirePermission(PELANGGAN_RESOURCE, "update");
  const parsed = pelangganFormSchema.parse(input);
  const id = await createPelanggan({
    villageId,
    nama: parsed.nama,
    kontak: parsed.kontak ?? null,
    alamat: parsed.alamat ?? null,
    keterangan: parsed.keterangan ?? null,
  });
  return { id };
}

export async function ubahPelanggan(villageId: number, id: number, input: unknown) {
  await requirePermission(PELANGGAN_RESOURCE, "update");
  const parsed = pelangganFormSchema.parse(input);
  await updatePelanggan(id, villageId, {
    nama: parsed.nama,
    kontak: parsed.kontak ?? null,
    alamat: parsed.alamat ?? null,
    keterangan: parsed.keterangan ?? null,
  });
}

export async function hapusPelanggan(villageId: number, id: number) {
  await requirePermission(PELANGGAN_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deletePelanggan(id, villageId);
}
