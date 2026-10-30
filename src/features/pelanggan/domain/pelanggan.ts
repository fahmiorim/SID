import { z } from "zod";

export const PELANGGAN_RESOURCE = "pelanggan";

export const pelangganFormSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(200),
  kontak: z.string().trim().max(100).optional().nullable(),
  alamat: z.string().trim().optional().nullable(),
  keterangan: z.string().trim().optional().nullable(),
});

export type PelangganFormInput = z.input<typeof pelangganFormSchema>;
export type PelangganFormValues = z.infer<typeof pelangganFormSchema>;

export interface PelangganDTO {
  id: number;
  villageId: number;
  nama: string;
  kontak: string | null;
  alamat: string | null;
  keterangan: string | null;
}
