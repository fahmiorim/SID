import { z } from "zod";

/** Masa berlaku kode verifikasi kontak (OS-WGA-001). */
export const MASA_BERLAKU_KODE_MS = 10 * 60 * 1000;
export const PANJANG_KODE = 6;

/** Normalkan nomor HP Indonesia ke format 62xxxxxxxxxx. */
export function normalisasiNomorHp(value: string): string {
  const digit = value.replace(/\D/g, "");
  if (digit.startsWith("0")) return `62${digit.slice(1)}`;
  if (digit.startsWith("62")) return digit;
  return digit;
}

export const verifikasiKontakSchema = z.object({
  target: z
    .string()
    .trim()
    .min(9, "Nomor HP minimal 9 digit.")
    .max(20, "Nomor HP maksimal 20 digit.")
    .transform(normalisasiNomorHp)
    .refine((value) => /^62\d{8,13}$/.test(value), "Format nomor HP tidak valid."),
});

export const kodeVerifikasiSchema = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${PANJANG_KODE}}$`), `Kode harus ${PANJANG_KODE} digit angka.`);

export interface StatusVerifikasiKontak {
  target: string | null;
  terverifikasi: boolean;
  kedaluwarsa: Date | null;
}
