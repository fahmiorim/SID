import { z } from "zod";

export const IDM_RESOURCE = "idm";

export const idmFormSchema = z.object({
  tahun: z.coerce.number().int().positive(),
  kode: z.string().min(1),
  nama: z.string().min(1),
  skor: z.coerce.number().optional().nullable(),
  kategori: z.string().nullable().optional(),
  keterangan: z.string().nullable().optional(),
});

export type IdmFormInput = z.input<typeof idmFormSchema>;
export type IdmFormValues = z.infer<typeof idmFormSchema>;

export interface IdmIndikatorDTO {
  id: number;
  villageId: number;
  tahun: number;
  kode: string;
  nama: string;
  skor: number | null;
  kategori: string | null;
  keterangan: string | null;
}
