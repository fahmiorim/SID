import { z } from "zod";

export const LAPAK_RESOURCE = "lapak";

export const lapakFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(200),
  pemilik: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  kategori: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  alamat: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  keterangan: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
});

export type LapakFormInput = z.input<typeof lapakFormSchema>;
export type LapakFormValues = z.infer<typeof lapakFormSchema>;

export interface LapakDTO {
  id: number;
  villageId: number;
  nama: string;
  pemilik: string | null;
  kategori: string | null;
  alamat: string | null;
  keterangan: string | null;
}
