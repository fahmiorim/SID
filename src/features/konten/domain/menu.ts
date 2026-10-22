import { z } from "zod";

/** Menu navigasi situs publik (Fase 1F.5). */

/** Setiap desa memiliki baris `menu_publik`. Form ini disinkronkan dengan
 * baris tersebut. Untuk instalasi baru bila belum ada menu, dipakai
 * `PUBLIC_NAV` bawaan.
 */
export const MENU_RESOURCE = "menuPublik";

/** Skema form menu publik. */
export const menuPublikFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama menu wajib diisi.").max(150, "Maksimal 150 karakter."),
  link: z.string().trim().min(1, "Link wajib diisi.").max(200, "Maksimal 200 karakter"),
  linkTipe: z.enum(["internal", "external"]).default("internal"),
  parentId: z.number().int().nullish(),
  urut: z.coerce
    .number({ error: "Urutan harus angka." })
    .int("Urutan harus bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .default(0),
  aktif: z.boolean().default(true),
});

export type MenuPublikFormInput = z.infer<typeof menuPublikFormSchema>;
