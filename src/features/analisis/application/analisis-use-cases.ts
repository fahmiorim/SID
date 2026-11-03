import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError, validationError } from "@/lib/errors";

import {
  ANALISIS_RESOURCE,
  indikatorAnalisisSchema,
  kategoriAnalisisSchema,
} from "../domain/analisis";
import {
  createAnalisisIndikator,
  createAnalisisKategori,
  deleteAnalisisIndikator,
  deleteAnalisisKategori,
  listAnalisisIndikator,
  listAnalisisKategori,
  updateAnalisisIndikator,
  updateAnalisisKategori,
} from "../infrastructure/analisis-repository";

export async function daftarKategoriAnalisis(villageId: number) {
  await requirePermission(ANALISIS_RESOURCE, "read");
  return listAnalisisKategori(villageId);
}

export async function daftarIndikatorAnalisis(villageId: number) {
  await requirePermission(ANALISIS_RESOURCE, "read");
  return listAnalisisIndikator(villageId);
}

export async function simpanKategoriAnalisis(villageId: number, input: unknown, id?: number) {
  await requirePermission(ANALISIS_RESOURCE, "update");
  const parsed = kategoriAnalisisSchema.parse(input);

  if (id !== undefined) {
    if (!id || id < 1) throw new AppError("NOT_FOUND", "ID kategori tidak valid.");
    await updateAnalisisKategori(id, villageId, {
      nama: parsed.nama,
      keterangan: parsed.keterangan ?? null,
    });
    return id;
  }

  return await createAnalisisKategori({
    villageId,
    nama: parsed.nama,
    keterangan: parsed.keterangan ?? null,
  });
}

export async function hapusKategoriAnalisis(villageId: number, id: number) {
  await requirePermission(ANALISIS_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID kategori tidak valid.");
  await deleteAnalisisKategori(id, villageId);
}

export async function simpanIndikatorAnalisis(villageId: number, input: unknown, id?: number) {
  await requirePermission(ANALISIS_RESOURCE, "update");
  const parsed = indikatorAnalisisSchema.parse(input);

  if (parsed.kategoriId !== null) {
    const kategori = await listAnalisisKategori(villageId);
    if (!kategori.some((item) => item.id === parsed.kategoriId)) {
      throw validationError("Kategori analisis tidak ditemukan.", {
        kategoriId: ["Pilih kategori yang terdaftar di desa ini."],
      });
    }
  }

  if (id !== undefined) {
    if (!id || id < 1) throw new AppError("NOT_FOUND", "ID indikator tidak valid.");
    await updateAnalisisIndikator(id, villageId, {
      kategoriId: parsed.kategoriId,
      kode: parsed.kode,
      nama: parsed.nama,
      keterangan: parsed.keterangan ?? null,
    });
    return id;
  }

  return await createAnalisisIndikator({
    villageId,
    kategoriId: parsed.kategoriId,
    kode: parsed.kode,
    nama: parsed.nama,
    keterangan: parsed.keterangan ?? null,
  });
}

export async function hapusIndikatorAnalisis(villageId: number, id: number) {
  await requirePermission(ANALISIS_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID indikator tidak valid.");
  await deleteAnalisisIndikator(id, villageId);
}
