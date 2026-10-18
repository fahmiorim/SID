import { z } from "zod";

/**
 * Primitif formulir bersama.
 *
 * Modul ini murni (tanpa I/O) dan dipakai lapisan `domain` fitur untuk menyusun
 * skema zod, sekaligus oleh komponen form di `presentation`.
 */

/**
 * Nilai sentinel untuk pilihan kosong pada select.
 *
 * Radix Select menolak item ber-`value` string kosong, sehingga "belum dipilih"
 * dikirim sebagai `"none"` lalu diterjemahkan kembali menjadi `null`.
 */
export const NO_SELECTION = "none";

/** Apakah sebuah nilai select dianggap "belum dipilih". */
export function isBlankSelection(value: unknown): boolean {
  return value === "" || value === null || value === undefined || value === NO_SELECTION;
}

/** Id referensi opsional (dari select) → angka atau `null`. */
export const optionalSelectId = z.preprocess(
  (value) => (isBlankSelection(value) ? null : value),
  z.coerce.number().int().positive().nullable(),
);

/** Tanggal ISO (`YYYY-MM-DD`) opsional → string atau `null`. */
export const optionalIsoDate = z.preprocess(
  (value) => (isBlankSelection(value) ? null : value),
  z.iso.date("Tanggal tidak valid.").nullable(),
);

/** NIK / Nomor KK: tepat `length` angka, boleh dikosongkan → string atau `null`. */
export function optionalDigits(length: number) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value === "" || new RegExp(`^\\d{${length}}$`).test(value),
      `Harus ${length} angka.`,
    )
    .transform((value) => (value === "" ? null : value));
}

/** Teks opsional dengan batas panjang; kosong menjadi `""` (dinormalkan repository). */
export function optionalText(max: number) {
  return z.string().trim().max(max, `Maksimal ${max} karakter.`).default("");
}

/** Satu pilihan katalog: `id` numerik + `name` untuk ditampilkan. */
export interface IdOption {
  id: number;
  name: string;
}

/** Satu pilihan berlabel siap tampil (mis. wilayah). */
export interface LabelOption {
  id: number;
  label: string;
}
