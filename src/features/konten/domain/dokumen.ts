import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";

/** Dokumen publik (Fase 1F.6). */
export const DOKUMEN_RESOURCE = RESOURCES.dokumenPublik;

/** Kategori dokumen yang tampil di situs publik. */
export const DOKUMEN_KATEGORI = ["informasi_publik", "produk_hukum", "lainnya"] as const;
export type DokumenKategori = (typeof DOKUMEN_KATEGORI)[number];

export const DOKUMEN_KATEGORI_LABELS: Record<DokumenKategori, string> = {
  informasi_publik: "Informasi publik",
  produk_hukum: "Produk hukum",
  lainnya: "Lainnya",
};

/** Baris dokumen yang aman dikirim ke komponen klien. */
export interface DokumenRow {
  id: number;
  nama: string;
  slug: string;
  kategori: string;
  jenis: string | null;
  nomor: string | null;
  tahun: number | null;
  berkas: string | null;
  tautan: string | null;
  keterangan: string | null;
  aktif: boolean;
}

const tautanSchema = z
  .string()
  .trim()
  .max(500, "Tautan maksimal 500 karakter.")
  .optional()
  .default("")
  .refine(
    (value) => !value || /^https?:\/\//i.test(value) || value.startsWith("/"),
    "Tautan harus URL http(s) atau path yang diawali '/'.",
  );

/** Skema form dokumen publik. */
export const dokumenPublikFormSchema = z
  .object({
    nama: z.string().trim().min(1, "Nama dokumen wajib diisi.").max(200, "Maksimal 200 karakter."),
    slug: z.string().trim().max(200, "Slug maksimal 200 karakter.").optional().default(""),
    kategori: z
      .enum(DOKUMEN_KATEGORI, { error: "Kategori tidak dikenal." })
      .default("informasi_publik"),
    jenis: z.string().trim().max(50, "Jenis maksimal 50 karakter.").optional().default(""),
    nomor: z.string().trim().max(100, "Nomor maksimal 100 karakter.").optional().default(""),
    keterangan: z.string().max(10_000, "Keterangan terlalu panjang.").optional().default(""),
    berkas: z.string().trim().max(255, "Path berkas maksimal 255 karakter.").optional().default(""),
    tautan: tautanSchema,
    tahun: z.coerce
      .number({ error: "Tahun harus angka." })
      .int("Tahun harus bilangan bulat.")
      .min(1900, "Tahun tidak valid.")
      .max(2100, "Tahun tidak valid.")
      .optional(),
    aktif: z.boolean().default(true),
  })
  .refine((data) => data.berkas !== "" || data.tautan !== "", {
    path: ["berkas"],
    message: "Isi path berkas atau tautan unduhan.",
  });

export type DokumenPublikFormInput = z.infer<typeof dokumenPublikFormSchema>;
