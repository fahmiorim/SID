import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { IDM_RESOURCE, idmFormSchema } from "../domain/idm";
import { createIdm, deleteIdm, listIdm } from "../infrastructure/idm-repository";

export async function daftarIdm(villageId: number, tahun?: number) {
  await requirePermission(IDM_RESOURCE, "read");
  return await listIdm(villageId, tahun);
}

export async function simpanIdm(villageId: number, input: unknown) {
  await requirePermission(IDM_RESOURCE, "update");
  const parsed = idmFormSchema.parse(input);
  const id = await createIdm({
    villageId,
    tahun: parsed.tahun,
    kode: parsed.kode,
    nama: parsed.nama,
    skor: parsed.skor ?? null,
    kategori: parsed.kategori ?? null,
    keterangan: parsed.keterangan ?? null,
  });
  return { id };
}

export async function hapusIdm(villageId: number, id: number) {
  await requirePermission(IDM_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deleteIdm(id, villageId);
}
