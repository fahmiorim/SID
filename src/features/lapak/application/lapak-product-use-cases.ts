import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { LAPAK_RESOURCE } from "../domain/lapak";
import { lapakProdukFormSchema, type LapakProdukDTO } from "../domain/lapak-produk";
import {
  createProdukLapak,
  deleteProdukLapak,
  findProdukLapak,
  listProdukLapak,
  updateProdukLapak,
} from "../infrastructure/lapak-produk-repository";

/** Daftar produk untuk satu lapak (admin). */
export async function daftarProdukLapak(
  villageId: number,
  lapakId: number,
  opts?: { q?: string; aktif?: boolean },
): Promise<LapakProdukDTO[]> {
  await requirePermission(LAPAK_RESOURCE, "read");
  const produk = await listProdukLapak(villageId, lapakId, opts);
  return produk.map((p) => ({
    id: p.id,
    villageId: p.villageId,
    lapakId: p.lapakId,
    nama: p.nama,
    deskripsi: p.deskripsi,
    harga: p.harga,
    stok: p.stok,
    gambar: p.gambar,
    aktif: Boolean(p.aktif),
    latitude: p.latitude,
    longitude: p.longitude,
  }));
}

/** Tambah produk baru. */
export async function tambahProdukLapak(
  villageId: number,
  lapakId: number,
  input: unknown,
): Promise<{ id: number }> {
  await requirePermission(LAPAK_RESOURCE, "update");
  const parsed = lapakProdukFormSchema.parse(input);

  const id = await createProdukLapak({
    villageId,
    lapakId,
    nama: parsed.nama,
    deskripsi: parsed.deskripsi ?? null,
    harga: parsed.harga ?? "0",
    stok: parsed.stok ? Number(parsed.stok) : 0,
    gambar: parsed.gambar ?? null,
    aktif: parsed.aktif ? 1 : 0,
    latitude: parsed.latitude ?? null,
    longitude: parsed.longitude ?? null,
  });

  return { id };
}

/** Update produk. */
export async function ubahProdukLapak(
  villageId: number,
  lapakId: number,
  id: number,
  input: unknown,
): Promise<void> {
  await requirePermission(LAPAK_RESOURCE, "update");
  const parsed = lapakProdukFormSchema.parse(input);

  await updateProdukLapak(id, villageId, lapakId, {
    nama: parsed.nama,
    deskripsi: parsed.deskripsi ?? null,
    harga: parsed.harga ?? "0",
    stok: parsed.stok ? Number(parsed.stok) : 0,
    gambar: parsed.gambar ?? null,
    aktif: parsed.aktif ? 1 : 0,
    latitude: parsed.latitude ?? null,
    longitude: parsed.longitude ?? null,
  });
}

/** Hapus produk. */
export async function hapusProdukLapak(
  villageId: number,
  lapakId: number,
  id: number,
): Promise<void> {
  await requirePermission(LAPAK_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID produk tidak valid.");
  await deleteProdukLapak(id, villageId, lapakId);
}

/** Temukan satu produk. */
export async function cariProdukLapak(
  villageId: number,
  lapakId: number,
  id: number,
): Promise<LapakProdukDTO | null> {
  await requirePermission(LAPAK_RESOURCE, "read");
  const produk = await findProdukLapak(id, villageId, lapakId);
  if (!produk) return null;

  return {
    id: produk.id,
    villageId: produk.villageId,
    lapakId: produk.lapakId,
    nama: produk.nama,
    deskripsi: produk.deskripsi,
    harga: produk.harga,
    stok: produk.stok,
    gambar: produk.gambar,
    aktif: Boolean(produk.aktif),
    latitude: produk.latitude,
    longitude: produk.longitude,
  };
}
