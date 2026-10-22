import { z } from "zod";

/** Dokumen publik (Fase 1F.6). */
export const DOKUMEN_RESOURCE = "dokumen-publik";

/** Skema form dokumen publik. */
export const dokumenPublikFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama dokumen wajib diisi.").max(200, "Maksimal 200 karakter."),
  slug: z.string().trim().min(1, "Slug wajib diisi.").max(200, "Maksimal 200 karakter"),
  kategori: z.string().trim().min(1, "Kategori wajib diisi.").max(100, "Maksimal 100 karakter"),
  keterangan: z.string().trim().optional(),
  berkas: z.string().url().optional(),
  tautan: z.string().url().optional(),
  tahun: z.coerce.number().int().min(0).optional(),
  aktif: z.boolean().default(true),
});

export type DokumenPublikFormInput = z.infer<typeof dokumenPublikFormSchema>;
