import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { ARSIP_RESOURCE, arsipFormSchema } from "../domain/arsip";
import {
  createArsip,
  deleteArsip,
  listArsip,
  listKategoriArsip,
  updateArsip,
} from "../infrastructure/arsip-repository";

export async function daftarArsip(villageId: number, opts?: { kategori?: string; q?: string }) {
  await requirePermission(ARSIP_RESOURCE, "read");
  return listArsip(villageId, opts);
}

export async function daftarKategoriArsip(villageId: number) {
  await requirePermission(ARSIP_RESOURCE, "read");
  return listKategoriArsip(villageId);
}

export async function tambahArsip(villageId: number, input: unknown) {
  await requirePermission(ARSIP_RESOURCE, "update");
  const parsed = arsipFormSchema.parse(input);
  const id = await createArsip({
    villageId,
    kategori: parsed.kategori ?? null,
    judul: parsed.judul,
    berkas: parsed.berkas ?? null,
    keterangan: parsed.keterangan ?? null,
  });
  return { id };
}

export async function ubahArsip(villageId: number, id: number, input: unknown) {
  await requirePermission(ARSIP_RESOURCE, "update");
  const parsed = arsipFormSchema.parse(input);
  await updateArsip(id, villageId, {
    kategori: parsed.kategori ?? null,
    judul: parsed.judul,
    berkas: parsed.berkas ?? null,
    keterangan: parsed.keterangan ?? null,
  });
}

export async function hapusArsip(villageId: number, id: number) {
  await requirePermission(ARSIP_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deleteArsip(id, villageId);
}
