import { z } from "zod";

/** Kunci penyimpanan browser kiosk; sama dengan yang dipakai OpenSID. */
export const ANJUNGAN_UUID_KEY = "anjungan_uuid";
export const ANJUNGAN_UUID_COOKIE = "anjungan_uuid";

interface PenyimpananUuid {
  getItem(kunci: string): string | null;
  setItem(kunci: string, nilai: string): void;
}

/** Mengembalikan UUID yang valid, atau null bila kosong/tidak valid. */
export function normalisasiUuidPerangkat(nilai: string | null | undefined): string | null {
  const kunci = nilai?.trim();
  if (!kunci) return null;
  return z.string().uuid().safeParse(kunci).success ? kunci : null;
}

/**
 * Membaca UUID perangkat dari penyimpanan browser. Bila belum ada atau tidak
 * valid, UUID baru dibuat dan disimpan. `baru` menandai bahwa browser ini
 * pertama kali dikenali sebagai kiosk.
 */
export function bacaAtauBuatUuidPerangkat(
  penyimpanan: PenyimpananUuid,
  buatUuid: () => string,
): { uuid: string; baru: boolean } {
  const tersimpan = normalisasiUuidPerangkat(penyimpanan.getItem(ANJUNGAN_UUID_KEY));
  if (tersimpan) return { uuid: tersimpan, baru: false };

  const uuid = normalisasiUuidPerangkat(buatUuid());
  if (!uuid) throw new Error("Gagal membuat UUID perangkat.");
  penyimpanan.setItem(ANJUNGAN_UUID_KEY, uuid);
  return { uuid, baru: true };
}
