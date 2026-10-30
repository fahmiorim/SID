import { z } from "zod";

export const ANJUNGAN_RESOURCE = "anjungan";

export const anjunganFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(200),
  deskripsi: z.string().trim().optional().nullable(),
  aktif: z.coerce.number().int().min(0).max(1).default(1),
  urutan: z.coerce.number().int().default(0),
});

export type AnjunganFormInput = z.input<typeof anjunganFormSchema>;
export type AnjunganFormValues = z.infer<typeof anjunganFormSchema>;

export interface AnjunganDTO {
  id: number;
  villageId: number;
  nama: string;
  deskripsi: string | null;
  aktif: number;
  urutan: number;
}
