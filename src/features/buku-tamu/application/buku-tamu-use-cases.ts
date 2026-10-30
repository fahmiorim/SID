import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { BUKU_TAMU_RESOURCE, bukuTamuFormSchema } from "../domain/buku-tamu";
import {
  createBukuTamu,
  deleteBukuTamu,
  listBukuTamu,
  updateBukuTamu,
} from "../infrastructure/buku-tamu-repository";

export async function daftarBukuTamu(villageId: number) {
  await requirePermission(BUKU_TAMU_RESOURCE, "read");
  const items = await listBukuTamu(villageId);
  return items.map((item) => {
    const t = item.tanggal;
    const tanggalStr =
      typeof t === "string" ? t : t instanceof Date ? t.toISOString().split("T")[0] : "";
    return { ...item, tanggal: tanggalStr as string };
  });
}

export async function tambahBukuTamu(villageId: number, input: unknown) {
  await requirePermission(BUKU_TAMU_RESOURCE, "update");
  const parsed = bukuTamuFormSchema.parse(input);
  const id = await createBukuTamu({
    villageId,
    nama: parsed.nama,
    instansi: parsed.instansi ?? null,
    keperluan: parsed.keperluan ?? null,
    tanggal: new Date(parsed.tanggal),
    keterangan: parsed.keterangan ?? null,
  });
  return { id };
}

export async function ubahBukuTamu(villageId: number, id: number, input: unknown) {
  await requirePermission(BUKU_TAMU_RESOURCE, "update");
  const parsed = bukuTamuFormSchema.parse(input);
  await updateBukuTamu(id, villageId, {
    nama: parsed.nama,
    instansi: parsed.instansi ?? null,
    keperluan: parsed.keperluan ?? null,
    tanggal: new Date(parsed.tanggal),
    keterangan: parsed.keterangan ?? null,
  });
}

export async function hapusBukuTamu(villageId: number, id: number) {
  await requirePermission(BUKU_TAMU_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deleteBukuTamu(id, villageId);
}
