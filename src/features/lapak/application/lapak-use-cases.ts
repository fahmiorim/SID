import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { LAPAK_RESOURCE, lapakFormSchema } from "../domain/lapak";
import {
  createLapak,
  deleteLapak,
  listKategoriLapak,
  listLapak,
  updateLapak,
} from "../infrastructure/lapak-repository";

export async function daftarLapak(villageId: number, opts?: { kategori?: string; q?: string }) {
  await requirePermission(LAPAK_RESOURCE, "read");
  return listLapak(villageId, opts);
}

export async function daftarKategoriLapak(villageId: number) {
  await requirePermission(LAPAK_RESOURCE, "read");
  return listKategoriLapak(villageId);
}

export async function tambahLapak(villageId: number, input: unknown) {
  await requirePermission(LAPAK_RESOURCE, "update");
  const parsed = lapakFormSchema.parse(input);
  const id = await createLapak({
    villageId,
    nama: parsed.nama,
    pemilik: parsed.pemilik ?? null,
    kategori: parsed.kategori ?? null,
    alamat: parsed.alamat ?? null,
    keterangan: parsed.keterangan ?? null,
  });
  return { id };
}

export async function ubahLapak(villageId: number, id: number, input: unknown) {
  await requirePermission(LAPAK_RESOURCE, "update");
  const parsed = lapakFormSchema.parse(input);
  await updateLapak(id, villageId, {
    nama: parsed.nama,
    pemilik: parsed.pemilik ?? null,
    kategori: parsed.kategori ?? null,
    alamat: parsed.alamat ?? null,
    keterangan: parsed.keterangan ?? null,
  });
}

export async function hapusLapak(villageId: number, id: number) {
  await requirePermission(LAPAK_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deleteLapak(id, villageId);
}
