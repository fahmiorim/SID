import { z } from "zod";

export const SISA_LEBIH_RESOURCE = "keuangan-sisa-lebih";

export const sisaLebihFormSchema = z.object({
  tahun: z.coerce.number().int().min(2000).max(2100),
  jumlah: z.string().min(1, "Jumlah wajib diisi"),
  keterangan: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  tanggal: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
});

export type SisaLebihFormInput = z.input<typeof sisaLebihFormSchema>;
export type SisaLebihFormValues = z.infer<typeof sisaLebihFormSchema>;

export interface SisaLebihDTO {
  id: number;
  villageId: number;
  tahun: number;
  jumlah: string | null;
  keterangan: string | null;
  tanggal: string | null;
}
