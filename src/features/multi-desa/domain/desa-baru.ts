import { z } from "zod";

/**
 * Normalisasi domain desa.
 *
 * Menerima input seperti `https://Desa-Sukamaju.id/` dan menyimpannya sebagai
 * `desa-sukamaju.id`; string kosong berarti desa belum dipetakan ke domain.
 * Normalisasi murni supaya dapat diuji tanpa database.
 */
export function normalisasiDomain(nilai: string): string | null {
  const bersih = nilai
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

  return bersih.length === 0 ? null : bersih;
}

const POLA_DOMAIN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

/**
 * Skema form pembuatan desa.
 *
 * `code` mengikuti panjang kode desa/kemendagri (10 digit). Domain opsional,
 * tetapi bila diisi harus berupa hostname tanpa protokol/path.
 */
export const desaBaruSchema = z.object({
  name: z.string().trim().min(3, "Nama desa minimal 3 karakter.").max(100),
  code: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Kode desa harus 10 digit angka."),
  domain: z
    .string()
    .trim()
    .max(255, "Domain maksimal 255 karakter.")
    .transform(normalisasiDomain)
    .refine(
      (domain) => domain === null || POLA_DOMAIN.test(domain),
      "Format domain tidak valid (contoh: desa-sukamaju.id).",
    ),
  district: z.string().trim().max(100).optional(),
  regency: z.string().trim().max(100).optional(),
  province: z.string().trim().max(100).optional(),
  headName: z.string().trim().max(100).optional(),
  adminName: z.string().trim().min(3, "Nama admin minimal 3 karakter.").max(255),
  adminUsername: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,50}$/, "Username 3–50 karakter: huruf, angka, titik, garis."),
  adminEmail: z
    .string()
    .trim()
    .toLowerCase()
    .max(255)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format email tidak valid."),
  adminPassword: z.string().min(8, "Sandi minimal 8 karakter.").max(72),
});

export type DesaBaruInput = z.infer<typeof desaBaruSchema>;
