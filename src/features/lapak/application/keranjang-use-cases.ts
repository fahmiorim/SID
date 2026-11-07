import "server-only";

import { AppError } from "@/lib/errors";

import type { KeranjangItemDTO } from "../domain/lapak-produk";
import {
  findProdukLapak,
  getKeranjangBySession,
  hapusKeranjangItem,
  hitungTotalKeranjang,
  kosongkanKeranjang,
  tambahKeranjang,
  updateKeranjangJumlah,
} from "../infrastructure/lapak-produk-repository";

/** Dapatkan keranjang belanja untuk session, hanya produk dari desa ini. */
export async function getKeranjang(
  sessionKey: string,
  villageId: number,
  lapakId?: number,
): Promise<KeranjangItemDTO[]> {
  return getKeranjangBySession(sessionKey, villageId, lapakId);
}

/** Tambah item ke keranjang. */
export async function tambahKeKeranjang(
  sessionKey: string,
  villageId: number,
  lapakId: number,
  produkId: number,
  jumlah: number = 1,
): Promise<{ id: number; merged: boolean }> {
  if (!Number.isInteger(jumlah) || jumlah <= 0) {
    throw new AppError("VALIDATION", "Jumlah harus bilangan bulat lebih dari 0.");
  }

  const produk = await findProdukLapak(produkId, villageId, lapakId);
  if (!produk) {
    throw new AppError("NOT_FOUND", "Produk tidak ditemukan pada lapak ini.");
  }
  if (!produk.aktif) {
    throw new AppError("VALIDATION", "Produk tidak tersedia.");
  }

  const stokTersedia: number = Number.isFinite(produk.stok) ? (produk.stok as number) : 0;

  if (stokTersedia <= 0) {
    throw new AppError("VALIDATION", "Stok produk tidak tersedia.");
  }

  const dicari = await getKeranjangBySession(sessionKey, villageId, lapakId);
  const existing = dicari.find((item) => item.produkId === produkId);
  if (existing) {
    const setelahDigabung = existing.jumlah + jumlah;
    if (setelahDigabung > stokTersedia) {
      throw new AppError(
        "VALIDATION",
        `Stok tidak cukup. Tersedia ${stokTersedia}개, jumlah yang diminta ${setelahDigabung}.`,
      );
    }

    await updateKeranjangJumlah(existing.id, sessionKey, setelahDigabung);
    return { id: existing.id, merged: true };
  }

  if (jumlah > stokTersedia) {
    throw new AppError(
      "VALIDATION",
      `Stok tidak cukup. Tersedia ${stokTersedia}개, jumlah yang diminta ${jumlah}.`,
    );
  }

  const id = await tambahKeranjang({
    lapakId,
    produkId,
    jumlah,
    sessionKey,
  });

  return { id, merged: false };
}

/** Update jumlah item keranjang. */
export async function updateJumlahKeranjang(
  sessionKey: string,
  id: number,
  jumlah: number,
): Promise<void> {
  if (!Number.isInteger(jumlah) || jumlah <= 0) {
    throw new AppError("VALIDATION", "Jumlah harus bilangan bulat lebih dari 0.");
  }
  await updateKeranjangJumlah(id, sessionKey, jumlah);
}

/** Hapus item dari keranjang. */
export async function hapusDariKeranjang(sessionKey: string, id: number): Promise<void> {
  await hapusKeranjangItem(id, sessionKey);
}

/** Kosongkan keranjang. */
export async function kosongkanKeranjangAction(sessionKey: string): Promise<void> {
  await kosongkanKeranjang(sessionKey);
}

/** Hitung total item di keranjang. */
export async function getTotalKeranjang(sessionKey: string): Promise<number> {
  return hitungTotalKeranjang(sessionKey);
}
